#app/main

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Ensure the static directory exists before mounting
os.makedirs("static/uploads/profile_pics", exist_ok=True)

from fastapi.staticfiles import StaticFiles
from app.routers import auth, profile, category, service, listing, request, booking, quote, review, payment, dashboard, user
from app.routers import admin  # Add this import
from app.routers import notification  # Import the new notification router

app = FastAPI()
origins = [
    "http://localhost:5173",
    "https://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="", tags=["Auth"])
app.include_router(profile.router)
app.include_router(category.router)
app.include_router(service.router)
app.include_router(listing.router)
app.include_router(request.router)
app.include_router(booking.router)
app.include_router(quote.router)
app.include_router(review.router)
app.include_router(payment.router)
app.include_router(dashboard.router)
app.include_router(user.router)
app.include_router(admin.router)  # Add this line
app.include_router(notification.router)  # Add this line