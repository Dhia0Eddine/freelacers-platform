from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Activity item for the dashboard
class ActivityItem(BaseModel):
    id: int
    type: str  # 'request', 'quote', 'booking', 'listing', etc.
    message: str
    timestamp: datetime

# Stats for the dashboard
class DashboardStats(BaseModel):
    totalRequests: int
    totalQuotes: int
    totalBookings: int
    totalListings: Optional[int] = None
    totalRevenue: Optional[float] = None
    averageRating: Optional[float] = None

# Request stats for customer dashboard
class RequestStats(BaseModel):
    pending: int
    quoted: int
    booked: int
    completed: int

# Client stats for provider dashboard
class ClientStats(BaseModel):
    new: int
    returning: int

# Basic dashboard response
class DashboardBase(BaseModel):
    stats: DashboardStats
    recentActivity: List[ActivityItem]

# Provider-specific dashboard
class ProviderDashboard(DashboardBase):
    responseRate: float
    avgResponseTime: str
    clientStats: ClientStats
    listings: List[Dict[str, Any]]
    requests: List[Dict[str, Any]]
    quotes: List[Dict[str, Any]]
    bookings: List[Dict[str, Any]]

# Customer-specific dashboard
class CustomerDashboard(DashboardBase):
    requestStats: RequestStats
    requests: List[Dict[str, Any]]
    quotes: List[Dict[str, Any]]
    bookings: List[Dict[str, Any]]
