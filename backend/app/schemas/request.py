from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class RequestStatus(str, Enum):
    open = "open"
    quoted = "quoted"
    booked = "booked"
    closed = "closed"

# Shared base schema
class RequestBase(BaseModel):
    listing_id: int  # 🔁 changed from service_id
    description: Optional[str]
    location: Optional[str]
    preferred_date: datetime
    status: RequestStatus = RequestStatus.open

# For creating a request
class RequestCreate(RequestBase):
    pass

# For returning request data
class RequestOut(RequestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# For updating a request
class RequestUpdate(BaseModel):
    listing_id: Optional[int] = None  # 🔁 changed from service_id
    description: Optional[str] = None
    location: Optional[str] = None
    preferred_date: Optional[datetime] = None
    status: Optional[RequestStatus] = None
