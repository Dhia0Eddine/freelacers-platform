from pydantic import BaseModel
from typing import Optional

class ProfileBase(BaseModel):
    full_name: str  # Note: Using snake_case here
    bio: Optional[str] = None
    location: str
    phone: Optional[str] = None  # Changed to Optional to allow None values
    average_rating: Optional[float] = None  # Add optional average_rating field

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None  # Add optional phone field for updates
    average_rating: Optional[float] = None  # Add optional average_rating field for updates

class ProfileOut(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True  # Updated from orm_mode=True which is deprecated
