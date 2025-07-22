from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base profile schema with common properties
class ProfileBase(BaseModel):
    full_name: str
    bio: Optional[str] = None
    location: str
    phone: Optional[str] = None  # Make phone optional to handle NULL values
    profile_picture: Optional[str] = None  # New field

# For creating a profile
class ProfileCreate(ProfileBase):
    pass

# For updating a profile
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None  # Keep phone optional
    profile_picture: Optional[str] = None  # New field

# For returning profile data
class ProfileOut(ProfileBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    average_rating: Optional[float] = None
    profile_picture: Optional[str] = None  # Ensure always present

    class Config:
        from_attributes = True
