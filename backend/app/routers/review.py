from typing import List  # already added
from app.models.profile import Profile
from app.models.booking import Booking
from app.models.user import User
from app.models.listing import Listing
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut
from pydantic import BaseModel  # Add this import if not present
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.utils.auth import get_current_user
from app.models.quote import Quote  # already added
from app.models.request import Request  # already added
from app.models.booking import BookingStatus  # Add this import
from datetime import datetime  # Add this import at the top

class ReviewUpdate(BaseModel):
    rating: int
    comment: str | None = None

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# 1. Submit review (customer only, but now allow provider too)
@router.post("/", response_model=ReviewOut)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=data.booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.completed:
         raise HTTPException(status_code=400, detail="Cannot review an incomplete booking")
    # Allow both customer and provider to review each other
    if current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="You are not part of this booking")

    # Determine reviewee
    if current_user.id == booking.customer_id:
        reviewee_id = booking.provider_id
    else:
        reviewee_id = booking.customer_id

    # Prevent duplicate reviews by the same user for this booking
    existing = db.query(Review).filter_by(booking_id=booking.id, reviewer_id=current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this booking.")

    # Create the review
    review = Review(
        booking_id=booking.id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=data.rating,
        comment=data.comment,
        created_at=datetime.utcnow()
    )
    db.add(review)

    # Set the has_review flag on the booking if both customer and provider have reviewed
    # (or keep as soon as one reviews for backward compatibility)
    # Optionally, you can track separate flags for customer/provider reviews if needed
    booking.has_review = True

    db.commit()
    db.refresh(review)

    # Update average rating for the reviewee (provider or customer)
    profile = db.query(Profile).filter(Profile.user_id == reviewee_id).first()
    if profile:
        all_reviews = db.query(Review).filter(Review.reviewee_id == reviewee_id).all()
        if all_reviews:
            profile.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        else:
            profile.average_rating = None
        db.commit()

    return review

# 2. Get all reviews for me (as provider)
@router.get("/me/received", response_model=List[ReviewOut])
def get_reviews_about_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all reviews where current user is the reviewee (for providers)"""
    return db.query(Review).filter_by(reviewee_id=current_user.id).all()

# Add new endpoint for reviews WRITTEN by me (as customer)
@router.get("/me/written", response_model=List[ReviewOut])
def get_reviews_written_by_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all reviews where current user is the reviewer (for customers)"""
    reviews = db.query(Review).filter_by(reviewer_id=current_user.id).all()
    
    # Enhance reviews with service information
    for review in reviews:
        # Get booking to find the associated service
        booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
        
        if booking:
            # Get quote to find the request
            quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
            
            if quote:
                # Get request to find the listing
                request = db.query(Request).filter(Request.id == quote.request_id).first()
                
                if request:
                    # Get listing info
                    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
                    
                    if listing:
                        review.service_title = listing.title
                        review.listing_id = listing.id
    
    return reviews

# Keep the original /me endpoint for backward compatibility but make it role-aware
@router.get("/me", response_model=List[ReviewOut])
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get reviews based on user role - reviews about me for providers, reviews by me for customers"""
    if current_user.role == "provider":
        return get_reviews_about_me(db=db, current_user=current_user)
    else:
        return get_reviews_written_by_me(db=db, current_user=current_user)

# 3. Get single review
@router.get("/{review_id}", response_model=ReviewOut)
def get_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter_by(id=review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

# Add new endpoint to get a review for a specific booking
@router.get("/booking/{booking_id}", response_model=ReviewOut)
def get_review_by_booking_id(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Only allow customer or provider to access, but only return the review written by the customer
    if current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view this review")
    
    # Only fetch the review where the reviewer is the customer
    review = db.query(Review).filter_by(booking_id=booking_id, reviewer_id=booking.customer_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found for this booking")
    
    return review

# Add this endpoint to your existing review.py router
@router.get("/listing/{listing_id}", response_model=List[ReviewOut])
def get_reviews_by_listing_id(listing_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a specific listing"""
    
    # First find all bookings for this listing via quotes
    bookings_query = (
        db.query(Booking)
        .join(Quote, Booking.quote_id == Quote.id)
        .join(Request, Quote.request_id == Request.id)
        .filter(Request.listing_id == listing_id)
    )
    
    booking_ids = [booking.id for booking in bookings_query.all()]
    
    if not booking_ids:
        return []
    
    # Then find all reviews for these bookings
    reviews = db.query(Review).filter(Review.booking_id.in_(booking_ids)).all()
    
    # Enhance reviews with reviewer name and service name
    for review in reviews:
        # Add reviewer name
        user = db.query(User).filter(User.id == review.reviewer_id).first()
        if user and user.profile:
            review.reviewer_name = user.profile.full_name
        else:
            # Instead of leaving it null, set to "Customer" with ID
            review.reviewer_name = f"Customer #{review.reviewer_id}"
        
        # Add service name from the booking -> quote -> request -> listing chain
        booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
        if booking:
            quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
            if quote:
                request = db.query(Request).filter(Request.id == quote.request_id).first()
                if request:
                    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
                    if listing:
                        review.service_name = listing.title
    
    return reviews

@router.get("/customer/{user_id}", response_model=List[ReviewOut])
def get_reviews_by_customer_id(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews made by a specific customer"""
    
    # Find all reviews where the reviewer is the specified user
    reviews = db.query(Review).filter(Review.reviewer_id == user_id).all()
    
    # Enhance reviews with service information
    for review in reviews:
        # Get booking to find the associated service
        booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
        
        if booking:
            # Get quote to find the request
            quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
            
            if quote:
                # Get request to find the listing
                request = db.query(Request).filter(Request.id == quote.request_id).first()
                
                if request:
                    # Get listing info
                    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
                    
                    if listing:
                        review.service_title = listing.title
                        review.listing_id = listing.id
    
    return reviews

@router.get("/about/{user_id}", response_model=List[ReviewOut])
def get_reviews_about_user(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews where specified user is the reviewee (for viewing provider profiles)"""
    reviews = db.query(Review).filter_by(reviewee_id=user_id).all()
    
    # Enhance reviews with reviewer name
    for review in reviews:
        # Add reviewer name
        user = db.query(User).filter(User.id == review.reviewer_id).first()
        if user and user.profile:
            review.reviewer_name = user.profile.full_name
        else:
            review.reviewer_name = f"Customer #{review.reviewer_id}"
        
        # Add service information if available
        booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
        if booking:
            quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
            if quote:
                request = db.query(Request).filter(Request.id == quote.request_id).first()
                if request:
                    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
                    if listing:
                        review.service_title = listing.title
                        review.listing_id = listing.id
    
    return reviews

@router.put("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    data: ReviewUpdate,  # Use ReviewUpdate instead of ReviewCreate
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.reviewer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this review")
    booking = db.query(Booking).filter(Booking.id == review.booking_id).first()
    if not booking or booking.status != BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Can only edit review for completed bookings")

    review.rating = data.rating
    review.comment = data.comment
    review.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)

    provider_id = review.reviewee_id
    profile = db.query(Profile).filter(Profile.user_id == provider_id).first()
    if profile:
        all_reviews = db.query(Review).filter(Review.reviewee_id == provider_id).all()
        if all_reviews:
            profile.average_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        else:
            profile.average_rating = None
        db.commit()

    return review
