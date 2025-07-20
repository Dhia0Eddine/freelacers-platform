from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileInfo(BaseModel):
    id: int
    user_id: int
    full_name: str
    location: Optional[str] = None
    average_rating: Optional[float] = None

    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    service_id: int
    title: str
    description: Optional[str]
    min_price: float
    max_price: float
    location: Optional[str]
    available: bool = True

class ListingCreate(ListingBase):
    pass

class ListingOut(ListingBase):
    id: int
    user_id: int  # Add user_id to the output schema
    created_at: datetime
    profile: Optional[ProfileInfo] = None

    class Config:
        from_attributes = True
