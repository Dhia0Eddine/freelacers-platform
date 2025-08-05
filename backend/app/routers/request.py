# app/routers/request.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging
import threading

from app.dependencies.db import get_db
from app.models.request import Request as RequestModel
from app.models.listing import Listing
from app.models.user import User
from app.schemas.request import RequestCreate, RequestOut, RequestUpdate
from app.utils.auth import get_current_user
from app.routers.notification import create_notification_sync

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/requests", tags=["Requests"])

# Create a request (only customer)
@router.post("/", response_model=RequestOut)
def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Add explicit check to ensure only customers can create requests
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only customers can create service requests"
        )

    # Check if the listing exists and is available
    listing = db.query(Listing).filter_by(id=request_data.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with ID {request_data.listing_id} not found"
        )
    
    # Optionally, check if the listing is available
    if not listing.available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This service is currently unavailable for booking"
        )

    # Prevent customers from requesting their own listings
    if listing.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot request your own service"
        )

    # Create the request
    new_request = RequestModel(**request_data.dict(), user_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Now handle notification separately to completely isolate it
    def send_notification_async():
        """Send notification in a separate thread to avoid blocking"""
        try:
            with Session(db.bind) as notification_db:
                provider_id = listing.user_id
                listing_title = listing.title
                
                notification_message = f"You have a new service request for '{listing_title}'"
                
                notification = create_notification_sync(
                    db=notification_db,
                    user_id=provider_id,
                    notification_type="request",
                    message=notification_message,
                    link=f"/request/{new_request.id}"
                )
                
                if notification:
                    logger.info(f"Notification created: ID {notification.id}")
                else:
                    logger.warning(f"Failed to create notification for request {new_request.id}")
        except Exception as e:
            logger.error(f"Error in notification thread: {str(e)}", exc_info=True)
    
    # Use Python's threading to handle notification asynchronously
    notification_thread = threading.Thread(target=send_notification_async)
    notification_thread.daemon = True
    notification_thread.start()
    
    return new_request

# View all open requests with optional filters
@router.get("/", response_model=List[RequestOut])
def list_requests(
    service_id: Optional[int] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(RequestModel)
    if service_id:
        query = query.filter(RequestModel.service_id == service_id)
    if location:
        query = query.filter(RequestModel.location.ilike(f"%{location}%"))
    if status:
        query = query.filter(RequestModel.status == status)
    return query.all()

# View current user's requests
@router.get("/me", response_model=List[RequestOut])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(RequestModel).filter(RequestModel.user_id == current_user.id).all()

# Get a specific request by ID (with user and profile data)
@router.get("/{request_id}", response_model=dict)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Use joinedload to efficiently load related user and profile data
    request = db.query(RequestModel).options(
        joinedload(RequestModel.user).joinedload(User.profile),
        joinedload(RequestModel.listing)
    ).filter(RequestModel.id == request_id).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check authorization - only the request creator or the listing owner can view
    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Associated listing not found")
    
    if request.user_id != current_user.id and listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")
    
    # Create a comprehensive response including user profile data
    result = {
        "id": request.id,
        "user_id": request.user_id,
        "listing_id": request.listing_id,
        "description": request.description,
        "location": request.location,
        "preferred_date": request.preferred_date,
        "status": request.status,
        "created_at": request.created_at,
        "listing": {
            "title": listing.title,
            "min_price": listing.min_price,
            "max_price": listing.max_price
        }
    }
    
    # Add detailed user data including profile
    if request.user:
        user_data = {
            "id": request.user.id,
            "email": request.user.email
        }
        
        # Add profile data if available
        if hasattr(request.user, 'profile') and request.user.profile:
            user_data["profile"] = {
                "id": request.user.profile.id,
                "full_name": request.user.profile.full_name,
                "location": request.user.profile.location,
                "phone": request.user.profile.phone
            }
        
        result["user"] = user_data
    
    return result

# Edit a request (only owner)
@router.patch("/{request_id}", response_model=RequestOut)
def update_request(
    request_id: int,
    request_data: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request_obj = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    if request_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")

    for field, value in request_data.dict(exclude_unset=True).items():
        setattr(request_obj, field, value)

    db.commit()
    db.refresh(request_obj)
    return request_obj

# Delete a request (only owner)
@router.delete("/{request_id}", status_code=204)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request_obj = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    if request_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")

    db.delete(request_obj)
    db.commit()