from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"

class UserStatus(str, Enum):
    enabled = "enabled"
    disabled = "disabled"

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    status: UserStatus = UserStatus.enabled

class UserCreate(UserBase):
    password: str  # plain text input, hash on server

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserStatusUpdate(BaseModel):
    status: UserStatus

