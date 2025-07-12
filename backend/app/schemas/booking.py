from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class BookingStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class BookingBase(BaseModel):
    quote_id: int
    customer_id: int
    provider_id: int
    scheduled_time: datetime
    status: BookingStatus = BookingStatus.scheduled

class BookingCreate(BookingBase):
    pass

class BookingOut(BookingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
