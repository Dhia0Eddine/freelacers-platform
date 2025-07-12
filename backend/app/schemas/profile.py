from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    user_id: int
    full_name: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    bio: Optional[str]
    profile_image: Optional[str]
    average_rating: Optional[float]

class ProfileCreate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
