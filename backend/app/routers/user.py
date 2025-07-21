from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_current_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current authenticated user's data"""
    # Fetch the user from the database to ensure we have the latest data
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
