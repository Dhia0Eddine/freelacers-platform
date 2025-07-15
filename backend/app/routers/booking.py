from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List  
from datetime import datetime


from app.models.booking import Booking
from app.models.quote import Quote
from app.models.request import Request
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingUpdate
from app.utils.auth import get_current_user
from app.dependencies.db import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# 1. CREATE booking (customer only)
@router.post("/", response_model=BookingOut)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create bookings")
    
    quote = db.query(Quote).filter_by(id=data.quote_id, status="accepted").first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found or not accepted")

    # Ensure quote belongs to this user's request
    request = db.query(Request).filter_by(id=quote.request_id).first()
    if request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot book this quote")

    booking = Booking(
        quote_id=quote.id,
        customer_id=current_user.id,
        provider_id=quote.provider_id,
        scheduled_time=data.scheduled_time,
        status="scheduled"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

# 2. GET bookings for current user
@router.get("/", response_model=List[BookingOut])
def get_user_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Booking).filter(
        (Booking.customer_id == current_user.id) |
        (Booking.provider_id == current_user.id)
    ).all()

# 3. UPDATE booking status (provider or customer)
@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking_status(booking_id: int, update: BookingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    booking.status = update.status
    db.commit()
    db.refresh(booking)
    return booking

# 4. GET single booking
@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter_by(id=booking_id).first()
    if not booking or current_user.id not in [booking.customer_id, booking.provider_id]:
        raise HTTPException(status_code=404, detail="Booking not found or not authorized")
    return booking
