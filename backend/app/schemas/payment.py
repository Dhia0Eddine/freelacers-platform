from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class PaymentMethod(str, Enum):
    stripe = "stripe"
    manual = "manual"

class PaymentCreate(BaseModel):
    booking_id: int
    amount: float
    method: PaymentMethod = PaymentMethod.manual

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    paid_at: datetime

    class Config:
        from_attributes = True
