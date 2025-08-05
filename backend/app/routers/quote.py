from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.dependencies.db import get_db
from app.models.quote import Quote
from app.models.user import User
from app.models.request import Request
from app.models.listing import Listing
from app.schemas.quote import QuoteCreate, QuoteOut, QuoteUpdate
from app.utils.auth import get_current_user
from app.routers.notification import create_notification_sync

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quotes", tags=["Quotes"])

# CREATE a quote (provider only)
@router.post("/", response_model=QuoteOut)
def create_quote(data: QuoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "provider":
        raise HTTPException(status_code=403, detail="Only providers can send quotes")

    request_obj = db.query(Request).filter_by(id=data.request_id).first()
    listing_obj = db.query(Listing).filter_by(id=data.listing_id, user_id=current_user.id).first()

    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    if not listing_obj:
        raise HTTPException(status_code=404, detail="Listing not found or not owned by user")
    quote = Quote(
        request_id=data.request_id,
        listing_id=data.listing_id,
        provider_id=current_user.id,
        price=data.price,
        message=data.message,
        status="pending"
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)
    
    # Send notification to customer
    try:
        # Get the customer ID from the request
        request_obj = db.query(Request).filter_by(id=data.request_id).first()
        if request_obj:
            customer_id = request_obj.user_id
            listing = db.query(Listing).filter_by(id=data.listing_id).first()
            
            if not listing:
                logger.warning(f"Could not find listing {data.listing_id} for notification")
                return quote
                
            listing_title = listing.title
            
            notification_message = f"You received a quote for '{listing_title}' - ${data.price}"
            
            # Create notification for the customer - use the sync version
            notification = create_notification_sync(
                db=db,
                user_id=customer_id,
                notification_type="quote",
                message=notification_message,
                link=f"/request/{data.request_id}"
            )
            
            if notification:
                logger.info(f"Notification created: ID {notification.id}")
            else:
                logger.warning(f"Failed to create notification for quote {quote.id}")
        else:
            logger.warning(f"Could not find request {data.request_id} for notification")
    except Exception as e:
        logger.error(f"Error creating notification for quote {quote.id}: {str(e)}", exc_info=True)
    
    return quote

# GET all quotes (optional filters)
@router.get("/", response_model=List[QuoteOut])
def get_quotes(db: Session = Depends(get_db)):
    return db.query(Quote).all()

# GET quotes for a specific request (for customers)
@router.get("/request/{request_id}", response_model=List[QuoteOut])
def get_quotes_for_request(request_id: int, db: Session = Depends(get_db)):
    return db.query(Quote).filter_by(request_id=request_id).all()

# GET a specific quote by ID
@router.get("/{quote_id}", response_model=QuoteOut)
def get_quote_by_id(quote_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quote = db.query(Quote).filter_by(id=quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Check authorization - either the quote provider or the request owner can view it
    request = db.query(Request).filter_by(id=quote.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Associated request not found")
    
    # Allow access if user is the provider who created the quote or the customer who owns the request
    if current_user.id != quote.provider_id and current_user.id != request.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this quote")
    
    return quote

# UPDATE quote status (customer only)
@router.patch("/{quote_id}/status", response_model=QuoteOut)
def update_quote_status(quote_id: int, update: QuoteUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quote = db.query(Quote).filter_by(id=quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    # Get request and confirm current user owns it
    request_obj = db.query(Request).filter_by(id=quote.request_id).first()
    if request_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update quotes on your own requests")

    if update.status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    quote.status = update.status
    db.commit()
    db.refresh(quote)
    return quote

# DELETE a quote (provider only)
@router.delete("/{quote_id}")
def delete_quote(quote_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quote = db.query(Quote).filter_by(id=quote_id, provider_id=current_user.id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found or not owned by user")
    
    db.delete(quote)
    db.commit()
    return {"detail": "Quote deleted"}
