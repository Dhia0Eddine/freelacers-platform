from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.dependencies.db import get_db
from app.models.listing import Listing
from app.schemas.listing import ListingCreate, ListingOut
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.service import Service  # Import the Service model
from app.models.profile import Profile  # Make sure to import this

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("/me", response_model=List[ListingOut])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get listings created by the current authenticated user"""
    listings = db.query(Listing).filter(Listing.user_id == current_user.id).all()
    print(f"Found {len(listings)} listings for current user {current_user.id}")
    return listings

@router.get("/", response_model=List[ListingOut])
def get_listings(
    keyword: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    service_id: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    # Start with base query - ensure we select all needed fields
    # Add joinedload to fetch user profiles with listings
    query = db.query(Listing).options(
        joinedload(Listing.user).joinedload(User.profile)
    ).filter(Listing.available == True)
    
    # Apply filters
    if keyword:
        query = query.filter(Listing.title.ilike(f"%{keyword}%") | Listing.description.ilike(f"%{keyword}%"))
    if service_id:
        query = query.filter(Listing.service_id == service_id)
    if location:
        query = query.filter(Listing.location.ilike(f"%{location}%"))
    if min_price is not None:
        query = query.filter(Listing.min_price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.max_price <= max_price)
    
    # Add pagination
    total = query.count()
    query = query.offset((page - 1) * limit).limit(limit)
    
    # Get results
    results = query.all()
    
    # Prepare the response items with profile information
    response_items = []
    for listing in results:
        # Convert the listing to a dictionary
        listing_dict = {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "min_price": listing.min_price,
            "max_price": listing.max_price,
            "location": listing.location,
            "available": listing.available,
            "user_id": listing.user_id,
            "service_id": listing.service_id,
            "created_at": listing.created_at
        }
        
        # Add profile information if available
        if listing.user and listing.user.profile:
            listing_dict["profile"] = {
                "id": listing.user.profile.id,
                "user_id": listing.user.profile.user_id,
                "full_name": listing.user.profile.full_name,
                "location": listing.user.profile.location,
                "average_rating": listing.user.profile.average_rating
            }
            print(f"Added profile for listing {listing.id}: {listing_dict['profile']}")
        else:
            print(f"No profile found for listing {listing.id}")
        
        response_items.append(listing_dict)
    
    return response_items


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    # Use joinedload to load the profile along with the listing
    listing = db.query(Listing).options(
        joinedload(Listing.user).joinedload(User.profile)
    ).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Convert the listing to a dictionary so we can add the profile data
    result = ListingOut.from_orm(listing).dict()
    
    # Add profile information if available
    if listing.user and listing.user.profile:
        result["profile"] = {
            "id": listing.user.profile.id,
            "user_id": listing.user.profile.user_id,
            "full_name": listing.user.profile.full_name,
            "location": listing.user.profile.location,
            "average_rating": listing.user.profile.average_rating
        }
    
    return result


@router.post("/", response_model=ListingOut)
def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "provider":
        raise HTTPException(status_code=403, detail="Only providers can create listings.")
    
    new_listing = Listing(**listing_data.dict(), user_id=current_user.id)
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    updated_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")

    # Check if the service_id is valid
    service = db.query(Service).filter(Service.id == updated_data.service_id).first()
    if not service:
        raise HTTPException(status_code=400, detail="Invalid service_id")

    for field, value in updated_data.dict().items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return {"detail": "Listing deleted successfully"}

@router.get("/user/{user_id}", response_model=List[ListingOut])
def get_listings_by_user_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get listings created by a specific user by their ID"""
    # First check if the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all active listings for this user
    listings = db.query(Listing).filter(
        Listing.user_id == user_id,
        Listing.available == True
    ).all()
    
    print(f"Found {len(listings)} listings for user {user_id}")
    return listings
