import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, User, Calendar, Filter } from 'lucide-react';
import { reviewService } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  provider_name?: string;
  service_name?: string;
}

export function DashboardReviewsCard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await reviewService.getMyReviews();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => {
        const rating = review.rating;
        if (filter === 'positive') return rating >= 4;
        if (filter === 'neutral') return rating === 3;
        if (filter === 'negative') return rating <= 2;
        return true;
      });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">My Reviews</CardTitle>
            <CardDescription>
              Reviews you've given to service providers
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="positive">Positive (4-5★)</SelectItem>
              <SelectItem value="neutral">Neutral (3★)</SelectItem>
              <SelectItem value="negative">Negative (1-2★)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-6">
            {filteredReviews.map(review => (
              <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full size-10 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {review.provider_name || 'Service Provider'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.service_name || 'Service'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>

                {review.comment && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
                    <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(review.created_at)}
                  </div>
                  <Button variant="ghost" size="sm">
                    View Booking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              When you leave reviews for services you've received, they'll appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
