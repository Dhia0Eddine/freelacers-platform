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
    user_id: int
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
