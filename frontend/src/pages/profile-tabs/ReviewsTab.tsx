import { Button } from '@/components/ui/button';
import { ChevronRight, Star, MessageSquare } from 'lucide-react';

interface Review {
  id: number;
  service_title?: string;
  listing_id?: number;
  created_at: string;
  rating: number;
  comment?: string;
}

interface ReviewsTabProps {
  reviews: Review[];
  navigate: any;
  t: any;
}

export default function ReviewsTab({ reviews, navigate, t }: ReviewsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6 transition-all duration-300 hover:shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t("my_reviews")}</h2>
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-5 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  {review.service_title && (
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-1">
                      {review.listing_id ? (
                        <Button
                          variant="link"
                          onClick={() => navigate(`/listings/${review.listing_id}`)}
                        >
                          {review.service_title}
                        </Button>
                      ) : (
                        review.service_title
                      )}
                    </h3>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t("posted_on")} {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    {review.rating}/5
                  </span>
                </div>
              </div>
              {review.comment && (
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-md">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                </div>
              )}
              {review.listing_id && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/listings/${review.listing_id}`)}
                  >
                    {t("view_service")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3 animate-bounce" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("no_reviews_yet")}</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t("after_completing_service_you_can_leave_reviews")}
          </p>
        </div>
      )}
    </div>
  );
}
