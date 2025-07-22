# schemas/booking.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class BookingStatus(str, Enum):
    scheduled = "scheduled"
    in_progress = "in_progress" 
    completed = "completed"
    cancelled = "cancelled"

class BookingCreate(BaseModel):
    quote_id: int
    scheduled_time: datetime

class BookingUpdate(BaseModel):
    status: str

class BookingOut(BaseModel):
    id: int
    quote_id: int
    customer_id: int
    provider_id: int
    scheduled_time: datetime
    status: str
    created_at: datetime
    has_review: bool = False  # Add has_review field with default value

    class Config:
        from_attributes = True
