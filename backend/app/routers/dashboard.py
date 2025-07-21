from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.dependencies.db import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.request import Request, RequestStatus
from app.models.quote import Quote
from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing
from app.models.review import Review
from app.schemas.dashboard import ProviderDashboard, CustomerDashboard, DashboardStats, ClientStats, RequestStats, ActivityItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Helper function to format a duration nicely
def format_duration(seconds: int) -> str:
    if seconds < 60:
        return f"{seconds} seconds"
    elif seconds < 3600:
        return f"{seconds // 60} minutes"
    elif seconds < 86400:
        return f"{seconds // 3600} hours"
    else:
        return f"{seconds // 86400} days"

# Get provider dashboard data
@router.get("/provider", response_model=ProviderDashboard)
async def get_provider_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get dashboard data for a service provider"""
    
    # Check if user is a provider
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only providers can access this dashboard"
        )
    
    # Get provider's listings
    listings = db.query(Listing).filter(Listing.user_id == current_user.id).all()
    listing_ids = [listing.id for listing in listings]
    
    # Get all requests for provider's listings
    requests = []
    if listing_ids:
        requests = db.query(Request).filter(Request.listing_id.in_(listing_ids)).all()
    
    # Get quotes sent by the provider
    quotes = db.query(Quote).filter(Quote.provider_id == current_user.id).all()
    
    # Get bookings where provider is involved
    bookings = db.query(Booking).filter(Booking.provider_id == current_user.id).all()
    
    # Calculate response rate (quotes / requests)
    total_requests = len(requests)
    total_responded = len([r for r in requests if r.status != RequestStatus.open])
    response_rate = (total_responded / total_requests * 100) if total_requests > 0 else 0
    
    # Calculate average response time (mock data for now)
    # In a real implementation, you'd compare quote.created_at with request.created_at
    avg_response_time = "4 hours"  # Placeholder
    
    # Calculate client stats
    unique_customers = set()
    repeat_customers = set()
    
    for booking in bookings:
        customer_id = booking.customer_id
        if customer_id in unique_customers:
            repeat_customers.add(customer_id)
        else:
            unique_customers.add(customer_id)
    
    new_clients = len(unique_customers) - len(repeat_customers)
    returning_clients = len(repeat_customers)
    
    # Get revenue from completed bookings (placeholder)
    # In a real implementation, you'd sum from payments table
    total_revenue = sum([100 for b in bookings if b.status == BookingStatus.completed])
    
    # Get average rating from reviews
    reviews = db.query(Review).filter(Review.reviewee_id == current_user.id).all()
    avg_rating = sum([r.rating for r in reviews]) / len(reviews) if reviews else None
    
    # Generate recent activity
    recent_activities = []
    
    # Add recent requests
    for i, req in enumerate(sorted(requests, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": i + 1,
            "type": "request",
            "message": f"New request received for listing '{req.listing.title}'",
            "timestamp": req.created_at
        })
    
    # Add recent quotes
    for i, quote in enumerate(sorted(quotes, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": len(recent_activities) + i + 1,
            "type": "quote",
            "message": f"You sent a quote for ${quote.price}",
            "timestamp": quote.created_at
        })
    
    # Add recent bookings
    for i, booking in enumerate(sorted(bookings, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": len(recent_activities) + i + 1,
            "type": "booking",
            "message": f"New booking scheduled for {booking.scheduled_time.strftime('%Y-%m-%d')}",
            "timestamp": booking.created_at
        })
    
    # Sort activities by timestamp
    recent_activities = sorted(recent_activities, key=lambda x: x["timestamp"], reverse=True)[:5]
    
    # Format listings for response
    formatted_listings = []
    for listing in listings:
        request_count = len([r for r in requests if r.listing_id == listing.id])
        formatted_listings.append({
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "min_price": listing.min_price,
            "max_price": listing.max_price,
            "location": listing.location,
            "available": listing.available,
            "service_id": listing.service_id,
            "created_at": listing.created_at,
            "request_count": request_count
        })
    
    # Format requests for response
    formatted_requests = []
    for req in requests:
        # Get customer name from the request's user
        customer_name = db.query(User).filter(User.id == req.user_id).first().profile.full_name if db.query(User).filter(User.id == req.user_id).first().profile else "Unknown Customer"
        
        formatted_requests.append({
            "id": req.id,
            "listing_id": req.listing_id,
            "listing_title": req.listing.title,
            "description": req.description,
            "preferred_date": req.preferred_date,
            "status": req.status,
            "created_at": req.created_at,
            "customer_id": req.user_id,  # Include the customer_id
            "customer_name": customer_name,
            "location": req.location
        })
    
    # Format quotes for response
    formatted_quotes = []
    for quote in quotes:
        # Get request and customer name
        request_obj = db.query(Request).filter(Request.id == quote.request_id).first()
        customer_name = db.query(User).filter(User.id == request_obj.user_id).first().profile.full_name if db.query(User).filter(User.id == request_obj.user_id).first().profile else "Unknown Customer"
        
        formatted_quotes.append({
            "id": quote.id,
            "request_id": quote.request_id,
            "price": quote.price,
            "description": quote.message,
            "expiry_date": datetime.now() + timedelta(days=7),  # Placeholder
            "status": quote.status,
            "created_at": quote.created_at,
            "customer_name": customer_name,
            "service_title": request_obj.listing.title
        })
    
    # Format bookings for response
    formatted_bookings = []
    for booking in bookings:
        # Get customer name
        customer_name = db.query(User).filter(User.id == booking.customer_id).first().profile.full_name if db.query(User).filter(User.id == booking.customer_id).first().profile else "Unknown Customer"
        
        # Get quote and associated listing/request
        quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
        listing_title = quote.request.listing.title if quote and quote.request and quote.request.listing else "Unknown Service"
        
        formatted_bookings.append({
            "id": booking.id,
            "quote_id": booking.quote_id,
            "scheduled_time": booking.scheduled_time,
            "status": booking.status,
            "created_at": booking.created_at,
            "customer_name": customer_name,
            "service_title": listing_title,
            "price": quote.price if quote else 0
        })
    
    # Compile dashboard data
    dashboard_data = {
        "stats": {
            "totalRequests": total_requests,
            "totalQuotes": len(quotes),
            "totalBookings": len(bookings),
            "totalListings": len(listings),
            "totalRevenue": total_revenue,
            "averageRating": avg_rating
        },
        "responseRate": response_rate,
        "avgResponseTime": avg_response_time,
        "clientStats": {
            "new": new_clients,
            "returning": returning_clients
        },
        "recentActivity": recent_activities,
        "listings": formatted_listings,
        "requests": formatted_requests,
        "quotes": formatted_quotes,
        "bookings": formatted_bookings
    }
    
    return dashboard_data

# Get customer dashboard data
@router.get("/customer", response_model=CustomerDashboard)
async def get_customer_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get dashboard data for a customer"""
    
    # Check if user is a customer
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this dashboard"
        )
    
    # Get customer's requests
    requests = db.query(Request).filter(Request.user_id == current_user.id).all()
    request_ids = [req.id for req in requests]
    
    # Get quotes received for these requests
    quotes = []
    if request_ids:
        quotes = db.query(Quote).filter(Quote.request_id.in_(request_ids)).all()
    
    # Get bookings where customer is involved
    bookings = db.query(Booking).filter(Booking.customer_id == current_user.id).all()
    
    # Get reviews left by this customer
    reviews = db.query(Review).filter(Review.reviewer_id == current_user.id).all()
    
    # Calculate request stats
    pending_requests = len([r for r in requests if r.status == RequestStatus.open])
    quoted_requests = len([r for r in requests if r.status == RequestStatus.quoted])
    booked_requests = len([r for r in requests if r.status == RequestStatus.booked])
    completed_requests = len([r for r in requests if r.status == RequestStatus.closed])
    
    # Generate recent activity
    recent_activities = []
    
    # Add recent requests
    for i, req in enumerate(sorted(requests, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": i + 1,
            "type": "request",
            "message": f"You requested '{req.listing.title}'",
            "timestamp": req.created_at
        })
    
    # Add recent quotes
    for i, quote in enumerate(sorted(quotes, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": len(recent_activities) + i + 1,
            "type": "quote",
            "message": f"You received a quote for ${quote.price}",
            "timestamp": quote.created_at
        })
    
    # Add recent bookings
    for i, booking in enumerate(sorted(bookings, key=lambda x: x.created_at, reverse=True)[:3]):
        recent_activities.append({
            "id": len(recent_activities) + i + 1,
            "type": "booking",
            "message": f"You booked a service for {booking.scheduled_time.strftime('%Y-%m-%d')}",
            "timestamp": booking.created_at
        })
    
    # Sort activities by timestamp
    recent_activities = sorted(recent_activities, key=lambda x: x["timestamp"], reverse=True)[:5]
    
    # Format requests for response
    formatted_requests = []
    for req in requests:
        # Get provider name from the listing's user
        provider_name = req.listing.user.profile.full_name if req.listing.user.profile else "Unknown Provider"
        
        formatted_requests.append({
            "id": req.id,
            "listing_id": req.listing_id,
            "listing_title": req.listing.title,
            "description": req.description,
            "preferred_date": req.preferred_date,
            "status": req.status,
            "created_at": req.created_at,
            "provider_name": provider_name
        })
    
    # Format quotes for response
    formatted_quotes = []
    for quote in quotes:
        # Get provider name
        provider = db.query(User).filter(User.id == quote.provider_id).first()
        provider_name = provider.profile.full_name if provider and provider.profile else "Unknown Provider"
        
        # Get request and associated listing
        request_obj = db.query(Request).filter(Request.id == quote.request_id).first()
        service_title = request_obj.listing.title if request_obj and request_obj.listing else "Unknown Service"
        
        formatted_quotes.append({
            "id": quote.id,
            "request_id": quote.request_id,
            "price": quote.price,
            "description": quote.message,
            "expiry_date": datetime.now() + timedelta(days=7),  # Placeholder
            "status": quote.status,
            "created_at": quote.created_at,
            "provider_name": provider_name,
            "service_title": service_title
        })
    
    # Format bookings for response
    formatted_bookings = []
    for booking in bookings:
        # Get provider name
        provider = db.query(User).filter(User.id == booking.provider_id).first()
        provider_name = provider.profile.full_name if provider and provider.profile else "Unknown Provider"
        
        # Get quote and associated listing/request
        quote = db.query(Quote).filter(Quote.id == booking.quote_id).first()
        listing_title = quote.request.listing.title if quote and quote.request and quote.request.listing else "Unknown Service"
        
        formatted_bookings.append({
            "id": booking.id,
            "quote_id": booking.quote_id,
            "scheduled_time": booking.scheduled_time,
            "status": booking.status,
            "created_at": booking.created_at,
            "provider_name": provider_name,
            "service_title": listing_title,
            "price": quote.price if quote else 0
        })
    
    # Compile dashboard data
    dashboard_data = {
        "stats": {
            "totalRequests": len(requests),
            "totalQuotes": len(quotes),
            "totalBookings": len(bookings),
            "averageRating": None  # Customers don't have ratings
        },
        "requestStats": {
            "pending": pending_requests,
            "quoted": quoted_requests,
            "booked": booked_requests,
            "completed": completed_requests
        },
        "recentActivity": recent_activities,
        "requests": formatted_requests,
        "quotes": formatted_quotes,
        "bookings": formatted_bookings
    }
    
    return dashboard_data
