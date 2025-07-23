from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies.db import get_db
from app.utils.auth import get_current_user
from app.models.user import User, UserRole
from app.models.listing import Listing
from app.models.request import Request as RequestModel
from app.models.review import Review
from app.schemas.user import UserOut
from app.schemas.listing import ListingOut
from app.schemas.request import RequestOut
from app.schemas.review import ReviewOut

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

# USERS
@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(User).all()

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None

@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "deactivated"
    db.commit()
    db.refresh(user)
    return user

# LISTINGS
@router.get("/listings", response_model=List[ListingOut])
def get_all_listings(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(Listing).all()

@router.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(listing)
    db.commit()
    return None

# REQUESTS
@router.get("/requests", response_model=List[RequestOut])
def get_all_requests(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(RequestModel).all()

@router.delete("/requests/{request_id}", status_code=204)
def delete_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    req = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    db.delete(req)
    db.commit()
    return None

# REVIEWS
@router.get("/reviews", response_model=List[ReviewOut])
def get_all_reviews(db: Session = Depends(get_db), _: User = Depends(admin_required)):
    return db.query(Review).all()

@router.delete("/reviews/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db), _: User = Depends(admin_required)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return None
