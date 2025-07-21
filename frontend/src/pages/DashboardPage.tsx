import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, Home, Users, Calendar, ClipboardList, MessageSquare, 
  Star, FileText, CheckCircle, Clock, CreditCard, LayoutDashboard, 
  AlertTriangle, Send, ShoppingBag
} from 'lucide-react';
import { DashboardStatsCards } from '../components/dashboard/DashboardStatsCards';
import { DashboardActivity } from '../components/dashboard/DashboardActivity';
import { DashboardRequestsCard } from '@/components/dashboard/DashboardRequestsCard';
import { DashboardQuotesCard } from '@/components/dashboard/DashboardQuotesCard';
import { DashboardBookingsCard } from '@/components/dashboard/DashboardBookingsCard';
import { DashboardReviewsCard } from '../components/dashboard/DashboardReviewsCard';
import { DashboardListingsCard } from '@/components/dashboard/DashboardListingsCard';
import { DashboardClientStatsCard } from '../components/dashboard/DashboardClientStatsCard';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { isAuthenticated, isCustomer, isProvider } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the appropriate dashboard data based on user role
        if (isProvider) {
          const data = await dashboardService.getProviderDashboard();
          setDashboardData(data);
        } else if (isCustomer) {
          const data = await dashboardService.getCustomerDashboard();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, isCustomer, isProvider, navigate]);

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
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          
          <TabsTrigger value="requests" className="rounded-md">
            <ClipboardList className="h-4 w-4 mr-2" />
            Requests
          </TabsTrigger>
          
          <TabsTrigger value="quotes" className="rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            Quotes
          </TabsTrigger>
          
          <TabsTrigger value="bookings" className="rounded-md">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>

          {isProvider && (
            <TabsTrigger value="clients" className="rounded-md">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
          )}
          
          {isCustomer && (
            <TabsTrigger value="reviews" className="rounded-md">
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
          )}
        </TabsList>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Failed to load dashboard</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="space-y-6">
              <DashboardStatsCards stats={stats} isProvider={isProvider} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardActivity activities={dashboardData?.recentActivity || []} />
                
                {isProvider && (
                  <DashboardClientStatsCard 
                    clientStats={dashboardData?.clientStats || {new: 0, returning: 0}}
                    responseRate={dashboardData?.responseRate || 0}
                    avgResponseTime={dashboardData?.avgResponseTime || '0 hours'}
                  />
                )}
                
                {isCustomer && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2" />
                        Request Status
                      </CardTitle>
                      <CardDescription>
                        Current status of your service requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.requestStats ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-xl font-medium text-blue-600 dark:text-blue-400">
                              {dashboardData.requestStats.pending}
                            </div>
                            <div className="text-sm text-gray-500">Pending</div>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                            <div className="text-xl font-medium text-amber-600 dark:text-amber-400">
                              {dashboardData.requestStats.quoted}
                            </div>
                            <div className="text-sm text-gray-500">Quoted</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-xl font-medium text-green-600 dark:text-green-400">
                              {dashboardData.requestStats.booked}
                            </div>
                            <div className="text-sm text-gray-500">Booked</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="text-xl font-medium text-purple-600 dark:text-purple-400">
                              {dashboardData.requestStats.completed}
                            </div>
                            <div className="text-sm text-gray-500">Completed</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No request data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {isProvider && (
                <DashboardListingsCard 
                  listings={dashboardData?.listings || []} 
                  onAddListing={() => navigate('/listings/new')}
                />
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-6">
              <DashboardRequestsCard 
                requests={dashboardData?.requests || []} 
                isProvider={isProvider}
              />
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-6">
              <DashboardQuotesCard 
                quotes={dashboardData?.quotes || []} 
                isProvider={isProvider}
              />
            </TabsContent>
            
            <TabsContent value="bookings" className="space-y-6">
              <DashboardBookingsCard 
                bookings={dashboardData?.bookings || []} 
                isProvider={isProvider}
              />
            </TabsContent>
            
            {isProvider && (
              <TabsContent value="clients" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Client Management
                    </CardTitle>
                    <CardDescription>
                      View and manage your clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      Client management features coming soon
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {isCustomer && (
              <TabsContent value="reviews" className="space-y-6">
                <DashboardReviewsCard />
              </TabsContent>
            )}
          </>
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
