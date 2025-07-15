from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.db import get_db
from app.models.listing import Listing
from app.schemas.listing import ListingCreate, ListingOut
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.service import Service  # Import the Service model

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("/", response_model=List[ListingOut])
def get_listings(
    service_id: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Listing).filter(Listing.available == True)
    if service_id:
        query = query.filter(Listing.service_id == service_id)
    if location:
        query = query.filter(Listing.location.ilike(f"%{location}%"))
    return query.all()


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


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
