from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from app.dependencies.db import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationOut, NotificationUpdate
from app.models.user import User
from app.utils.auth import get_current_user

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Function for other routes to create notifications
def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    message: str,
    link: Optional[str] = None,
    is_read: bool = False
) -> Notification:
    """
    Create a notification for a user.
    
    Args:
        db: Database session
        user_id: User ID to create notification for
        notification_type: Type of notification (request, quote, booking, etc.)
        message: Notification message
        link: Optional link to navigate to
        is_read: Whether notification is already read
        
    Returns:
        Created notification object
    """
    try:
        logger.info(f"Creating notification for user {user_id}: {message}")
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User ID {user_id} not found when creating notification")
            return None
        
        # Create notification object
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            message=message,
            link=link,
            is_read=is_read,
            created_at=datetime.utcnow()
        )
        
        # Add to database
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        logger.info(f"Successfully created notification ID {notification.id}")
        return notification
        
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        db.rollback()
        # Return None instead of raising to prevent breaking the main functionality
        return None

# Get all notifications for current user
@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Order by created_at descending (newest first)
    query = query.order_by(Notification.created_at.desc())
    
    return query.all()

# Get unread notification count
@router.get("/count", response_model=dict)
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get count of unread notifications for the current user"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}

# Mark notification as read
@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    update: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = update.is_read
    db.commit()
    db.refresh(notification)
    
    return notification

# Mark all notifications as read
@router.patch("/read-all", response_model=dict)
def mark_all_as_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Mark all notifications as read for the current user"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"success": True, "message": "All notifications marked as read"}
    return {"success": True, "message": "All notifications marked as read"}
