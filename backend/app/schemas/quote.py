# schemas/quote.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuoteCreate(BaseModel):
    request_id: int
    listing_id: int
    price: float
    message: Optional[str] = None

class QuoteUpdate(BaseModel):
    status: str  # should be "accepted" or "rejected"
class QuoteOut(BaseModel):
    id: int
    request_id: int
    listing_id: int
    provider_id: int
    price: float
    message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
