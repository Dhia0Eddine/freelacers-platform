# File: backend/app/models/quote.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class QuoteStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)

    price = Column(Float, nullable=False)
    message = Column(String)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    provider = relationship("User", back_populates="quotes")
    request = relationship("Request", back_populates="quotes")
    listing = relationship("Listing", back_populates="quotes")
    booking = relationship("Booking", uselist=False, back_populates="quote")
    
# app/models/quote.py

# ADD this inside the Quote model:

    # Assuming User, Request, and Listing models exist and have a foreign key to Quote
    # If not, you need to define those models similarly to how Quote is defined     
    # If you have a User model, it should have a relationship defined like this:
    # quotes = relationship("Quote", back_populates="provider", cascade="all, delete")
    # If you have a Request model, it should have a relationship defined like this:
    # quotes = relationship("Quote", back_populates="request", cascade="all, delete")
    # If you have a Listing model, it should have a relationship defined like this:
    # quotes = relationship("Quote", back_populates="listing", cascade="all, delete")   
