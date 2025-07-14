from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ListingBase(BaseModel):
    service_id: int
    title: str
    description: Optional[str]
    min_price: float
    max_price: float
    location: Optional[str]
    available: bool = True

class ListingCreate(ListingBase):
    pass

class ListingOut(ListingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
