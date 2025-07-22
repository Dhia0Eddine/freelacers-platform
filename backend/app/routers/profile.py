# app/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
from app.models.user import User
from app.utils.auth import get_current_user
import os
from uuid import uuid4
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.post("/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
):
    # Save image to disk (for demo; in prod use S3 or similar)
    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid image type")
    upload_dir = "static/uploads/profile_pics"
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"profile_{uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    url = f"/static/uploads/profile_pics/{filename}"
    return {"url": url}

@router.post("/", response_model=ProfileOut)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists.")

    new_profile = Profile(user_id=current_user.id, **profile_data.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@router.put("/", response_model=ProfileOut)
def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{user_id}", response_model=ProfileOut)
def get_profile_by_user_id(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile
