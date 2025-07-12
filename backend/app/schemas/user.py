from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str  # plain text input, hash on server

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        # This allows Pydantic to read data as dictionaries from ORM models
        # and convert them to Pydantic models.
        # It is useful when you want to serialize SQLAlchemy models directly.
        
