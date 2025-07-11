from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
import enum
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    # One-to-one
    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete")

    # Provider-side
    listings = relationship("Listing", back_populates="provider", cascade="all, delete-orphan")
    quotes = relationship("Quote", back_populates="provider", cascade="all, delete-orphan")
    bookings_as_provider = relationship("Booking", foreign_keys="[Booking.provider_id]", back_populates="provider")

    # Customer-side
    requests = relationship("Request", back_populates="customer", cascade="all, delete-orphan")
    bookings_as_customer = relationship("Booking", foreign_keys="[Booking.customer_id]", back_populates="customer")

    # Reviews
    reviews_given = relationship("Review", foreign_keys="[Review.reviewer_id]", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="[Review.reviewee_id]", back_populates="reviewee")
