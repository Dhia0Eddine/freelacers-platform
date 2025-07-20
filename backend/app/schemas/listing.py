from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Base listing model with common properties
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    min_price: float
    max_price: float
    location: Optional[str] = None
    available: bool = True
    service_id: int

# For creating a listing
class ListingCreate(ListingBase):
    pass

# For returning basic listing data
class ListingOut(ListingBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None  # Make the field optional

    class Config:
        from_attributes = True

# Add this new model for profile data
class ProfileInfo(BaseModel):
    id: int
    user_id: int
    full_name: str
    location: Optional[str] = None
    average_rating: Optional[float] = None

    class Config:
        from_attributes = True

# Enhanced listing output model with profile
class ListingOutWithProfile(ListingOut):
    profile: Optional[ProfileInfo] = None

    class Config:
        from_attributes = True

# New model for paginated listing responses
class PaginatedListingResponse(BaseModel):
    items: List[ListingOutWithProfile]
    total: int
    page: int
    limit: int
    pages: int

    class Config:
        from_attributes = True
