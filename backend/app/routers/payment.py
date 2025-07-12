from sqlalchemy import Column, Integer, ForeignKey, Numeric, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin
import enum

class PaymentMethod(enum.Enum):
    credit_card = "credit_card"
    paypal = "paypal"
    stripe = "stripe"
    manual = "manual"

class PaymentStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"))
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(Enum(PaymentMethod), default=PaymentMethod.manual)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    paid_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="payment")
