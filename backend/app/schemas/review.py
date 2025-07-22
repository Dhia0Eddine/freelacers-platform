from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    booking_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    service_title: Optional[str] = None  # Add this field
    listing_id: Optional[int] = None  # Add this field
    reviewer_name: Optional[str] = None  # Keep this field from previous changes

    class Config:
        from_attributes = True
