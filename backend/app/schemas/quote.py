from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class QuoteStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class QuoteBase(BaseModel):
    provider_id: int
    request_id: int
    listing_id: int
    price: float
    message: Optional[str]
    status: QuoteStatus = QuoteStatus.pending

class QuoteCreate(QuoteBase):
    pass

class QuoteOut(QuoteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
