import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, MessageSquare, Calendar, BarChart2, DollarSign, Star } from 'lucide-react';

interface DashboardStats {
  totalRequests: number;
  totalQuotes: number;
  totalBookings: number;
  totalListings?: number;
  totalRevenue?: number;
  averageRating?: number | null;
}

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  isProvider: boolean;
}

export function DashboardStatsCards({ stats, isProvider }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Requests Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Requests</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalRequests}</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quotes</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalQuotes}</h3>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3">
              <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bookings</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalBookings}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider-specific stats */}
      {isProvider && (
        <>
          {/* Listings Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Listings</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalListings || 0}</h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-3">
                  <BarChart2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">
                    ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
                  </h3>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Rating Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
              <h3 className="text-2xl font-bold mt-1">
                {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
              </h3>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
