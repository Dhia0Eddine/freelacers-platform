from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.schemas.payment import PaymentCreate, PaymentOut
from app.models.payment import Payment
from app.models.booking import Booking

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentOut)
def create_dummy_payment(data: PaymentCreate, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Simulate payment (assume always successful)
    payment = Payment(
        booking_id=booking.id,
        amount=data.amount,
        method=data.method,
        status="paid"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment
