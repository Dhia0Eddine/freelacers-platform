from pydantic import BaseModel
from typing import Optional

class ProfileCreate(BaseModel):
    full_name: str
    phone: str
    location: str
    bio: Optional[str] = None

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class ProfileOut(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
