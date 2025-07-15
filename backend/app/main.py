#app/main

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, profile, category, service,listing, request, booking,quote, review,payment
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(profile.router)
app.include_router(category.router)
app.include_router(service.router)
app.include_router(listing.router)
app.include_router(request.router)
app.include_router(booking.router)
app.include_router(quote.router)
app.include_router(review.router)
app.include_router(payment.router)