import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { dashboardService } from '@/services/api';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  Inbox, 
  Loader2, 
  MessageSquare, 
  RefreshCw,
  Send,
  ShoppingBag,
  Star,
  Users,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DashboardStatsCard } from '@/components/dashboard/DashboardStatsCard';
import { DashboardRequestsCard } from '../components/dashboard/DashboardRequestsCard';
import { DashboardQuotesCard } from '../components/dashboard/DashboardQuotesCard';
import { DashboardBookingsCard } from '../components/dashboard/DashboardBookingsCard';
import { DashboardListingsCard } from '../components/dashboard/DashboardListingsCard';
import { CircularProgressIndicator } from '../components/dashboard/CircularProgressIndicator';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated, isProvider, isCustomer } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (isProvider) {
        data = await dashboardService.getProviderDashboard();
      } else {
        data = await dashboardService.getCustomerDashboard();
      }
      
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Extract dashboard stats
  const stats = dashboardData?.stats || {
    totalRequests: 0,
    totalQuotes: 0,
    totalBookings: 0,
    totalListings: isProvider ? 0 : undefined,
    totalRevenue: isProvider ? 0 : undefined,
    averageRating: 0
  };

  // Role-specific headings
  const roleSpecificHeading = isProvider ? 'Provider Dashboard' : 'Customer Dashboard';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{roleSpecificHeading}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Welcome back! Here's an overview of your account activity.
      </p>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          {isProvider && <TabsTrigger value="listings">Listings</TabsTrigger>}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardStatsCard 
              title="Requests"
              value={stats.totalRequests}
              description={isProvider ? "Received requests" : "Sent requests"}
              icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
            />
            
            <DashboardStatsCard 
              title="Quotes"
              value={stats.totalQuotes}
              description={isProvider ? "Sent quotes" : "Received quotes"}
              icon={<FileText className="h-6 w-6 text-indigo-500" />}
            />
            
            <DashboardStatsCard 
              title="Bookings"
              value={stats.totalBookings}
              description="Scheduled services"
              icon={<Calendar className="h-6 w-6 text-green-500" />}
            />
            
            {isProvider ? (
              <DashboardStatsCard 
                title="Listings"
                value={stats.totalListings || 0}
                description="Active service listings"
                icon={<ShoppingBag className="h-6 w-6 text-orange-500" />}
              />
            ) : (
              <DashboardStatsCard 
                title="Rating"
                value={stats.averageRating?.toFixed(1) || "N/A"}
                description="Your average rating"
                icon={<Star className="h-6 w-6 text-yellow-500" />}
                valuePrefix=""
                isRating={true}
              />
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ActivityIcon className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className={`rounded-full p-2 ${getActivityIconBackground(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent activity to display</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm">View All Activity</Button>
            </CardFooter>
          </Card>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Provider-specific cards */}
            {isProvider && (
              <>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Revenue
                    </CardTitle>
                    <CardDescription>Total earnings this month</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-3xl font-bold mb-2">${stats.totalRevenue || 0}</div>
                    <CircularProgressIndicator 
                      percentage={75} 
                      size={120} 
                      strokeWidth={10}
                    />
                    <p className="text-sm text-gray-500 mt-4">75% of your monthly goal</p>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Client Breakdown
                    </CardTitle>
                    <CardDescription>Customer distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-full grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">{dashboardData?.clientStats?.new || 0}</div>
                        <p className="text-sm text-gray-500">New Clients</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">{dashboardData?.clientStats?.returning || 0}</div>
                        <p className="text-sm text-gray-500">Returning</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(dashboardData?.clientStats?.new || 0) / ((dashboardData?.clientStats?.new || 0) + (dashboardData?.clientStats?.returning || 0)) * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Common for both roles */}
            <Card className={isProvider ? "col-span-1" : "col-span-full"}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Inbox className="h-5 w-5 mr-2" />
                  {isProvider ? "Response Rate" : "Service Requests"}
                </CardTitle>
                <CardDescription>
                  {isProvider ? "Request response performance" : "Your current service requests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProvider ? (
                  <div className="flex flex-col items-center">
                    <CircularProgressIndicator 
                      percentage={dashboardData?.responseRate || 0} 
                      size={120} 
                      strokeWidth={10}
                      color={getResponseRateColor(dashboardData?.responseRate || 0)}
                    />
                    <p className="text-lg font-semibold mt-4">{dashboardData?.responseRate || 0}% Response Rate</p>
                    <p className="text-sm text-gray-500">Average response time: {dashboardData?.avgResponseTime || 'N/A'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-semibold">{dashboardData?.requestStats?.pending || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quoted</span>
                      <span className="font-semibold">{dashboardData?.requestStats?.quoted || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Booked</span>
                      <span className="font-semibold">{dashboardData?.requestStats?.booked || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-semibold">{dashboardData?.requestStats?.completed || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab(isProvider ? 'requests' : 'bookings')}>
                  {isProvider ? 'View All Requests' : 'Manage Requests'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="requests">
          <DashboardRequestsCard 
            requests={dashboardData?.requests || []}
            isProvider={isProvider}
          />
        </TabsContent>
        
        {/* Quotes Tab */}
        <TabsContent value="quotes">
          <DashboardQuotesCard 
            quotes={dashboardData?.quotes || []}
            isProvider={isProvider}
          />
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <DashboardBookingsCard 
            bookings={dashboardData?.bookings || []}
            isProvider={isProvider}
          />
        </TabsContent>
        
        {/* Listings Tab (Provider Only) */}
        {isProvider && (
          <TabsContent value="listings">
            <DashboardListingsCard 
              listings={dashboardData?.listings || []}
              onAddListing={() => navigate('/listings/new')}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Helper functions
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className || "h-5 w-5"}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'request':
      return <Send className="h-4 w-4 text-white" />;
    case 'quote':
      return <FileText className="h-4 w-4 text-white" />;
    case 'booking':
      return <Calendar className="h-4 w-4 text-white" />;
    case 'listing':
      return <ShoppingBag className="h-4 w-4 text-white" />;
    default:
      return <MessageSquare className="h-4 w-4 text-white" />;
  }
};

const getActivityIconBackground = (type: string) => {
  switch (type) {
    case 'request':
      return 'bg-blue-500';
    case 'quote':
      return 'bg-indigo-500';
    case 'booking':
      return 'bg-green-500';
    case 'listing':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getResponseRateColor = (rate: number) => {
  if (rate >= 90) return '#22c55e'; // green
  if (rate >= 70) return '#3b82f6'; // blue
  if (rate >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
};
