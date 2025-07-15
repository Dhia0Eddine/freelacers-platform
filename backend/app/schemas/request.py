from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class RequestStatus(str, Enum):
    open = "open"
    quoted = "quoted"
    booked = "booked"
    closed = "closed"

class RequestBase(BaseModel):
    service_id: int
    description: Optional[str]
    location: Optional[str]
    preferred_date: datetime
    status: RequestStatus = RequestStatus.open

class RequestCreate(RequestBase):
    pass

class RequestOut(RequestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RequestUpdate(BaseModel):
    service_id: Optional[int] = None
    description: Optional[str] = None
    location: Optional[str] = None
    preferred_date: Optional[datetime] = None
    status: Optional[RequestStatus] = None
