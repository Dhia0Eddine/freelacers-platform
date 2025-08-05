from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List  
from datetime import datetime
import logging

from app.models.booking import Booking
from app.models.quote import Quote
from app.models.request import Request
from app.models.user import User
from app.models.review import Review
from app.models.profile import Profile
from app.models.listing import Listing
from app.schemas.booking import BookingCreate, BookingOut, BookingUpdate
from app.utils.auth import get_current_user
from app.dependencies.db import get_db
from app.routers.notification import create_notification_sync  # Change to sync version

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# 1. CREATE booking (customer only)
@router.post("/", response_model=BookingOut)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create bookings")
    
    quote = db.query(Quote).filter_by(id=data.quote_id, status="accepted").first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found or not accepted")

    # Ensure quote belongs to this user's request
    request = db.query(Request).filter_by(id=quote.request_id).first()
    if request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot book this quote")

    # Get the listing_id from the quote or request
    listing_id = getattr(quote, "listing_id", None)
    if not listing_id:
        # fallback: try to get from request if not present on quote
        listing_id = getattr(request, "listing_id", None)
    if not listing_id:
        raise HTTPException(status_code=400, detail="Listing ID not found for booking")

    booking = Booking(
        quote_id=quote.id,
        customer_id=current_user.id,
        provider_id=quote.provider_id,
        listing_id=listing_id,
        scheduled_time=data.scheduled_time,
        status="scheduled"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Send notification to provider
    try:
        provider_id = quote.provider_id
        
        # Get service title
        quote_obj = db.query(Quote).filter_by(id=data.quote_id).first()
        request_obj = db.query(Request).filter_by(id=quote_obj.request_id).first()
        listing_obj = db.query(Listing).filter_by(id=request_obj.listing_id).first()
        
        if not listing_obj:
            logger.warning(f"Could not find listing for booking {booking.id}")
            return booking
            
        formatted_date = booking.scheduled_time.strftime("%Y-%m-%d at %H:%M")
        notification_message = f"Your service '{listing_obj.title}' has been booked for {formatted_date}"
        
        # Create notification for the provider - use sync version
        notification = create_notification_sync(
            db=db,
            user_id=provider_id,
            notification_type="booking",
            message=notification_message,
            link=f"/booking/{booking.id}"
        )
        
        if notification:
            logger.info(f"Notification created: ID {notification.id}")
        else:
            logger.warning(f"Failed to create notification for booking {booking.id}")
    except Exception as e:
        logger.error(f"Error creating notification for booking {booking.id}: {str(e)}", exc_info=True)
    
    return booking

# 2. GET bookings for current user
@router.get("/", response_model=List[BookingOut])
def get_user_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Booking).filter(
        (Booking.customer_id == current_user.id) |
        (Booking.provider_id == current_user.id)
    ).all()

# 3. UPDATE booking status (provider or customer)
@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking_status(booking_id: int, update: BookingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    booking.status = update.status
    db.commit()
    db.refresh(booking)
    return booking

# 4. GET single booking
@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking or current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=404, detail="Booking not found or not authorized")
    return booking

# --- Add review endpoints for both provider and customer ---

@router.post("/{booking_id}/review", response_model=dict)
def create_review_for_booking(
    booking_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allow both provider and customer to review each other after booking is completed.
    data: { rating: int, comment: str }
    """
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking or booking.status != "completed":
        raise HTTPException(status_code=400, detail="Booking not found or not completed")

    # Determine reviewee and reviewer
    if current_user.id == booking.customer_id:
        reviewee_id = booking.provider_id
        reviewer_role = "customer"
    elif current_user.id == booking.provider_id:
        reviewee_id = booking.customer_id
        reviewer_role = "provider"
    else:
        raise HTTPException(status_code=403, detail="Not authorized to review this booking")

    # Prevent duplicate reviews by the same user for this booking
    existing_review = db.query(Review).filter_by(
        booking_id=booking_id,
        reviewer_id=current_user.id
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this booking.")

    review = Review(
        booking_id=booking_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=data["rating"],
        comment=data.get("comment", "")
    )
    db.add(review)
    db.commit()

    # After review, update average_rating for customer if reviewee is customer
    if reviewer_role == "provider":
        customer_profile = db.query(Profile).filter(Profile.user_id == reviewee_id).first()
        if customer_profile:
            # Calculate new average rating for customer
            customer_reviews = db.query(Review).filter_by(reviewee_id=reviewee_id).all()
            if customer_reviews:
                avg = sum(r.rating for r in customer_reviews) / len(customer_reviews)
                customer_profile.average_rating = avg
                db.commit()
    
    # Send notification to the reviewee
    try:
        # Get listing info for more detailed notification
        listing = db.query(Listing).filter_by(id=booking.listing_id).first()
        service_name = listing.title if listing else "your service"
        
        # Craft appropriate message based on who is reviewing
        if reviewer_role == "customer":
            notification_message = f"You received a {data['rating']}-star review for {service_name}"
        else:
            notification_message = f"You received a {data['rating']}-star review from a service provider"
        
        # Create notification - use sync version
        notification = create_notification_sync(
            db=db,
            user_id=reviewee_id,
            notification_type="review",
            message=notification_message,
            link=f"/booking/{booking_id}"
        )
        
        if notification:
            logger.info(f"Notification created: ID {notification.id}")
        else:
            logger.warning(f"Failed to create notification for review on booking {booking_id}")
    except Exception as e:
        logger.error(f"Error creating notification for review on booking {booking_id}: {str(e)}", exc_info=True)

    return {"success": True, "review_id": review.id}
