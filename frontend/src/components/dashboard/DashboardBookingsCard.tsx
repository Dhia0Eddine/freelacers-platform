import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, Filter, MapPin, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  quote_id: number;
  scheduled_time: string;
  status: string;
  created_at: string;
  price: number;
  customer_name?: string;
  provider_name?: string;
  service_title?: string;
  location?: string;
}

interface DashboardBookingsCardProps {
  bookings: Booking[];
  isProvider: boolean;
}

export function DashboardBookingsCard({ bookings, isProvider }: DashboardBookingsCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredBookings = bookings
    .filter(booking => {
      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (booking.service_title && booking.service_title.toLowerCase().includes(searchLower)) ||
          (booking.customer_name && booking.customer_name.toLowerCase().includes(searchLower)) ||
          (booking.provider_name && booking.provider_name.toLowerCase().includes(searchLower)) ||
          (booking.location && booking.location.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime();
      } else {
        return new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime();
      }
    });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isUpcoming = (scheduledTime: string) => {
    return new Date(scheduledTime).getTime() > Date.now();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Bookings
            </CardTitle>
            <CardDescription>
              {isProvider 
                ? 'Your scheduled service appointments'
                : 'Your booked service appointments'
              }
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-9"
            >
              {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isUpcoming(booking.scheduled_time) && booking.status === 'scheduled'
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-medium">
                      {booking.service_title || 'Service Booking'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      {isProvider ? (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>Client: {booking.customer_name || 'Customer'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>Provider: {booking.provider_name || 'Provider'}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(booking.price)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(booking.status)}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                    <span>{formatDate(booking.scheduled_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                    <span>{formatTime(booking.scheduled_time)}</span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                      <span>{booking.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4">
                  <div className="flex gap-2">
                    <Link to={`/bookings/${booking.id}`}>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </Link>
                    {!isProvider && booking.status === 'completed' && (
                      <Button size="sm">
                        Leave Review
                      </Button>
                    )}
                    {isProvider && booking.status === 'scheduled' && (
                      <Button size="sm">
                        Start Service
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {statusFilter !== 'all' 
                ? `No ${statusFilter.replace('_', ' ')} bookings found` 
                : 'No bookings found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {isProvider
                ? "You don't have any service bookings yet."
                : "You haven't booked any services yet."}
            </p>
            {!isProvider && (
              <Link to="/listings">
                <Button>
                  Browse Services
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
