# schemas/booking.py

from pydantic import BaseModel
from datetime import datetime

class BookingCreate(BaseModel):
    quote_id: int
    scheduled_time: datetime

class BookingUpdate(BaseModel):
    status: str  # scheduled, completed, cancelled

class BookingOut(BaseModel):
    id: int
    quote_id: int
    customer_id: int
    provider_id: int
    scheduled_time: datetime
    status: str
    created_at: datetime

    class Config:
         from_attributes = True
