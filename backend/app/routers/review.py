from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.models.review import Review
from app.models.booking import Booking,BookingStatus
from app.schemas.review import ReviewCreate, ReviewOut
from app.dependencies.db import get_db
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# 1. Submit review (customer only)
@router.post("/", response_model=ReviewOut)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=data.booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    

    if booking.status != BookingStatus.completed:
         raise HTTPException(status_code=400, detail="Cannot review an incomplete booking")
    
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You didn't make this booking")

    existing = db.query(Review).filter_by(booking_id=booking.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")

    review = Review(
        booking_id=booking.id,
        reviewer_id=current_user.id,
        reviewee_id=booking.provider_id,
        rating=data.rating,
        comment=data.comment,
        created_at=datetime.utcnow()
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

# 2. Get all reviews for me (as provider)
@router.get("/me", response_model=List[ReviewOut])
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Review).filter_by(reviewee_id=current_user.id).all()

# 3. Get single review
@router.get("/{review_id}", response_model=ReviewOut)
def get_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter_by(id=review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
