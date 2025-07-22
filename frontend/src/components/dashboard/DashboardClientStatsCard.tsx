import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, Clock } from 'lucide-react';

interface ClientStatsProps {
  clientStats: {
    new: number;
    returning: number;
  };
  responseRate: number;
  avgResponseTime: string;
}

export function DashboardClientStatsCard({ clientStats, responseRate, avgResponseTime }: ClientStatsProps) {
  // Helper function to get color based on response rate
  const getResponseRateColor = (rate: number) => {
    if (rate >= 90) return '#22c55e'; // green
    if (rate >= 70) return '#3b82f6'; // blue
    if (rate >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Client Statistics
        </CardTitle>
        <CardDescription>
          Your client engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-xl font-medium text-green-600 dark:text-green-400">
              {clientStats.new}
            </div>
            <div className="text-sm text-gray-500">New Clients</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-xl font-medium text-blue-600 dark:text-blue-400">
              {clientStats.returning}
            </div>
            <div className="text-sm text-gray-500">Returning Clients</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-sm font-medium">Response Rate</span>
              </div>
              <span className="text-sm font-medium" style={{ color: getResponseRateColor(responseRate) }}>
                {responseRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${responseRate}%`, 
                  backgroundColor: getResponseRateColor(responseRate) 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-indigo-500 mr-1" />
              <span className="text-sm font-medium">Avg. Response Time</span>
            </div>
            <span className="text-sm">{avgResponseTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
