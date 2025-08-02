import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Filter, MapPin, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Request {
  id: number;
  listing_id: number;
  listing_title: string;
  description?: string;
  preferred_date: string;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_id?: number;
  provider_name?: string;
  provider_id?: number;
  location?: string;
}

interface DashboardRequestsCardProps {
  requests: Request[];
  isProvider: boolean;
}

export function DashboardRequestsCard({ requests, isProvider }: DashboardRequestsCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  
  // Filter and sort requests
  const filteredRequests = requests
    .filter(request => {
      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (request.listing_title && request.listing_title.toLowerCase().includes(searchLower)) ||
          (request.description && request.description.toLowerCase().includes(searchLower)) ||
          (request.customer_name && request.customer_name.toLowerCase().includes(searchLower)) ||
          (request.provider_name && request.provider_name.toLowerCase().includes(searchLower)) ||
          (request.location && request.location.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'quoted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'booked':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              {isProvider ? 'Service Requests' : 'My Requests'}
            </CardTitle>
            <CardDescription>
              {isProvider 
                ? 'Review and respond to customer service requests'
                : 'Track the status of your service requests'
              }
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search requests..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-9"
            >
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div 
                key={request.id}
                className="border rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-medium">
                      <Link 
                        to={`/listings/${request.listing_id}`} 
                        className="hover:text-blue-600 transition-colors"
                      >
                        {request.listing_title}
                      </Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      {isProvider ? (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {request.customer_id ? (
                            <Link 
                              to={`/profile/${request.customer_id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {request.customer_name || 'Anonymous Customer'}
                            </Link>
                          ) : (
                            <span>{request.customer_name || 'Anonymous Customer'}</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {request.provider_id ? (
                            <Link 
                              to={`/profile/${request.provider_id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {request.provider_name || 'Service Provider'}
                            </Link>
                          ) : (
                            <span>{request.provider_name || 'Service Provider'}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Preferred: {formatDate(request.preferred_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Requested: {formatDate(request.created_at)}</span>
                      </div>
                      {request.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{request.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {request.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {request.description || 'No description provided'}
                </p>
                
                <div className="flex justify-end mt-2">
                  <Button 
                    size="sm"
                    onClick={() => navigate(isProvider ? `/request/${request.id}` : `/my-requests/${request.id}`)}
                  >
                    {isProvider && request.status === 'open' ? 'Send Quote' : 'View Details'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-12 w-12 mx-auto text-gray-400 mb-4">
              {statusFilter !== 'all' 
                ? <Filter className="h-12 w-12 mx-auto" />
                : isProvider ? <User className="h-12 w-12 mx-auto" /> : <Calendar className="h-12 w-12 mx-auto" />
              }
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} requests found` 
                : 'No requests found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {isProvider
                ? "You don't have any service requests to review at the moment."
                : "You haven't submitted any service requests yet."}
            </p>
            {!isProvider && (
              <Button onClick={() => navigate('/listings')}>
                Browse Services
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}