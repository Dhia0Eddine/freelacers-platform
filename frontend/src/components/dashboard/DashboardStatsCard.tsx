import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  valuePrefix?: string;
  isRating?: boolean;
}

export function DashboardStatsCard({
  title,
  value,
  description,
  icon,
  valuePrefix = '',
  isRating = false
}: DashboardStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {valuePrefix}{value}
          {isRating && value !== 'N/A' && (
            <span className="inline-flex items-center ml-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
