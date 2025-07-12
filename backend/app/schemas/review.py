from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    booking_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int  # 1 to 5
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
