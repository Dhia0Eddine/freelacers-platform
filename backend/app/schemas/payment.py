from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class PaymentMethod(str, Enum):
    credit_card = "credit_card"
    paypal = "paypal"
    stripe = "stripe"
    manual = "manual"

class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class PaymentBase(BaseModel):
    booking_id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    paid_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
