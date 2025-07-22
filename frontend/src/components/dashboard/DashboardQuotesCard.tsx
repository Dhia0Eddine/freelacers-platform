import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, FileText, Filter, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Quote {
  id: number;
  request_id: number;
  price: number;
  description: string;
  expiry_date: string;
  status: string;
  created_at: string;
  customer_name?: string;
  provider_name?: string;
  service_title?: string;
}

interface DashboardQuotesCardProps {
  quotes: Quote[];
  isProvider: boolean;
}

export function DashboardQuotesCard({ quotes, isProvider }: DashboardQuotesCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredQuotes = quotes
    .filter(quote => {
      // Status filter
      if (statusFilter !== 'all' && quote.status !== statusFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (quote.description && quote.description.toLowerCase().includes(searchLower)) ||
          (quote.customer_name && quote.customer_name.toLowerCase().includes(searchLower)) ||
          (quote.provider_name && quote.provider_name.toLowerCase().includes(searchLower)) ||
          (quote.service_title && quote.service_title.toLowerCase().includes(searchLower))
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
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'expired':
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {isProvider ? 'Sent Quotes' : 'Received Quotes'}
            </CardTitle>
            <CardDescription>
              {isProvider 
                ? 'Quotes you\'ve sent to customers'
                : 'Quotes from service providers'
              }
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search quotes..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
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
        {filteredQuotes.length > 0 ? (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <div 
                key={quote.id}
                className="border rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-medium">
                      {quote.service_title || 'Quote for Service'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      {isProvider ? (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>For: {quote.customer_name || 'Customer'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          <span>From: {quote.provider_name || 'Provider'}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{formatDate(quote.created_at)}</span>
                      </div>
                      <div className="flex items-center font-medium text-green-600 dark:text-green-400">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        <span>{formatPrice(quote.price)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(quote.status)}>
                    {quote.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {quote.description || 'No description provided.'}
                </p>
                
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Expires: {formatDate(quote.expiry_date)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Link to={`/quotes/${quote.id}`}>
                    <Button size="sm">
                      {!isProvider && quote.status === 'pending' ? 'Respond to Quote' : 'View Details'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} quotes found` 
                : 'No quotes found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {isProvider
                ? "You haven't sent any quotes to customers yet."
                : "You haven't received any quotes from providers yet."}
            </p>
            {isProvider && (
              <Link to="/requests">
                <Button>
                  View Requests
                </Button>
              </Link>
            )}
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
