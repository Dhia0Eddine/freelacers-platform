import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, MessageSquare, ShoppingBag, Send } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface DashboardActivityProps {
  activities: ActivityItem[];
}

export function DashboardActivity({ activities }: DashboardActivityProps) {
  // Get icon for activity type
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

  // Get background color for activity type
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

  // Format date for display
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest platform activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`${getActivityIconBackground(activity.type)} rounded-full p-1.5 flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activities to display
          </div>
        )}
      </CardContent>
    </Card>
  );
}
