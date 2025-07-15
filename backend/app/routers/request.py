# app/routers/request.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.dependencies.db import get_db
from app.models.request import Request as RequestModel
from app.schemas.request import RequestCreate, RequestOut, RequestUpdate
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Requests"])

# Create a request (only customer)
@router.post("/", response_model=RequestOut)
def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create requests")

    new_request = RequestModel(**request_data.dict(), user_id=current_user.id)
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

# View all open requests with optional filters
@router.get("/", response_model=List[RequestOut])
def list_requests(
    service_id: Optional[int] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(RequestModel)
    if service_id:
        query = query.filter(RequestModel.service_id == service_id)
    if location:
        query = query.filter(RequestModel.location.ilike(f"%{location}%"))
    if status:
        query = query.filter(RequestModel.status == status)
    return query.all()

# View current user's requests
@router.get("/me", response_model=List[RequestOut])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(RequestModel).filter(RequestModel.user_id == current_user.id).all()

# Get a specific request by ID
@router.get("/{request_id}", response_model=RequestOut)
def get_request_by_id(request_id: int, db: Session = Depends(get_db)):
    request_obj = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    return request_obj

# Edit a request (only owner)
@router.patch("/{request_id}", response_model=RequestOut)
def update_request(
    request_id: int,
    request_data: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request_obj = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    if request_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")

    for field, value in request_data.dict(exclude_unset=True).items():
        setattr(request_obj, field, value)

    db.commit()
    db.refresh(request_obj)
    return request_obj

# Delete a request (only owner)
@router.delete("/{request_id}", status_code=204)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request_obj = db.query(RequestModel).filter(RequestModel.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    if request_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")

    db.delete(request_obj)
    db.commit()
