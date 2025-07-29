import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Calendar, User, Clock, CheckCircle, XCircle, Star, ChevronRight } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { reviewService } from '@/services/api';

interface Booking {
  id: number;
  quote_id: number;
  scheduled_time: string;
  status: string;
  created_at: string;
  customer_name?: string;
  provider_name?: string;
  service_title?: string;
  price?: number;
  has_review?: boolean; // Make this optional again for backward compatibility
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

interface BookingReview {
  bookingId: number;
  review: Review;
}

interface DashboardBookingsCardProps {
  bookings: Booking[];
  isProvider: boolean;
}

export function DashboardBookingsCard({ bookings, isProvider }: DashboardBookingsCardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingReview, setEditingReview] = useState<BookingReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const navigate = useNavigate();

  // Enhanced debug logging to help diagnose issues with reviews
  useEffect(() => {
    console.log("All bookings:", bookings);
    console.log("Bookings with has_review:", bookings.filter(b => b.has_review === true).map(b => b.id));
    
    const fetchReviews = async () => {
      const bookingsWithReviews = bookings.filter(b => b.has_review === true);
      if (bookingsWithReviews.length === 0) return;

      console.log(`Fetching reviews for ${bookingsWithReviews.length} bookings with has_review=true`);
      
      const fetched = await Promise.all(
        bookingsWithReviews.map(async (b) => {
          try {
            const reviewData = await reviewService.getBookingReview(b.id);
            console.log(`Fetched review for booking ${b.id}:`, reviewData);
            return { bookingId: b.id, review: reviewData };
          } catch (error) {
            console.error(`Failed to fetch review for booking ${b.id}:`, error);
            return null;
          }
        })
      );

      const validReviews = fetched.filter(r => r !== null) as BookingReview[];
      console.log(`Successfully fetched ${validReviews.length} reviews:`, validReviews);
      setReviews(validReviews);
    };

    fetchReviews();
  }, [bookings]);

  const handleReviewSubmit = async (data: { rating: number; comment?: string }) => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        booking_id: selectedBooking.id,
        rating: data.rating,
        comment: data.comment,
      });

      setReviews([
        ...reviews,
        {
          bookingId: selectedBooking.id,
          review: {
            id: 0,
            rating: data.rating,
            comment: data.comment,
            created_at: new Date().toISOString(),
          },
        },
      ]);

      selectedBooking.has_review = true;
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add update review handler
  const handleUpdateReview = async (data: { rating: number; comment?: string }) => {
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      // Call your API to update the review (assumes reviewService.updateReview exists)
      await reviewService.updateReview(editingReview.review.id, {
        rating: data.rating,
        comment: data.comment,
      });
      // Update local state
      setReviews(reviews.map(r =>
        r.bookingId === editingReview.bookingId
          ? { ...r, review: { ...r.review, rating: data.rating, comment: data.comment } }
          : r
      ));
      setShowEditReviewModal(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add provider review logic
  const handleProviderReviewSubmit = async (data: { rating: number; comment?: string }) => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      await reviewService.createBookingReview(selectedBooking.id, {
        rating: data.rating,
        comment: data.comment,
      });
      setReviews([
        ...reviews,
        {
          bookingId: selectedBooking.id,
          review: {
            id: 0,
            rating: data.rating,
            comment: data.comment,
            created_at: new Date().toISOString(),
          },
        },
      ]);
      selectedBooking.has_review = true;
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error submitting provider review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === activeFilter.toLowerCase());

  const getReviewForBooking = (id: number) => reviews.find(r => r.bookingId === id)?.review;
  
  // Improved function to check if a booking has been reviewed
  const hasReviewedBooking = (booking: Booking) => {
    // Check if has_review exists and is true
    if (booking.has_review === true) {
      console.log(`Booking ${booking.id} has has_review=true`);
      return true;
    }
    
    // If has_review is undefined, look for review in our local state
    const hasReviewInState = reviews.some(r => r.bookingId === booking.id);
    
    if (hasReviewInState) {
      console.log(`Found review in local state for booking ${booking.id}`);
    }
    
    return hasReviewInState;
  };

  // Add edit review handler
  const handleEditReview = (bookingId: number) => {
    const reviewObj = reviews.find(r => r.bookingId === bookingId);
    if (reviewObj) {
      setEditingReview(reviewObj);
      setShowEditReviewModal(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>
          {isProvider ? 'View and manage your customer bookings' : 'Track your service bookings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter}>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {activeFilter !== 'all' ? `No ${activeFilter} bookings` : 'No bookings found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isProvider
                    ? "You don't have any bookings in this filter."
                    : "You haven't booked any services in this filter."}
                </p>
                {!isProvider && (
                  <Button onClick={() => navigate('/listings')}>Browse Services</Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => {
                  // Log detailed info about each booking to help debug
                  console.log(`Rendering booking ${booking.id}, has_review:`, booking.has_review, 
                              "type:", typeof booking.has_review);
                  
                  const review = getReviewForBooking(booking.id);
                  if (review) {
                    console.log(`Found review for booking ${booking.id}:`, review);
                  }
                  
                  return (
                    <div
                      key={booking.id}
                      className="border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 bg-white dark:bg-gray-800">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {booking.service_title || 'Service Booking'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isProvider
                                ? `Customer: ${booking.customer_name || 'N/A'}`
                                : `Provider: ${booking.provider_name || 'N/A'}`}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeClass(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.scheduled_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {booking.price && (
                            <div className="flex items-center gap-1">
                              <span>${booking.price}</span>
                            </div>
                          )}
                        </div>

                        {/* Make sure review content is displayed when it exists */}
                        {review && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-2">{review.rating}/5</span>
                            </div>
                            {review.comment && (
                              <p className="italic mt-1 text-gray-600 dark:text-gray-300">"{review.comment}"</p>
                            )}
                            {/* Edit Review Button */}
                            {!isProvider && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => handleEditReview(booking.id)}
                              >
                                Edit Review
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                        <span className="text-sm text-gray-500">
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {!isProvider && booking.status === 'completed' && (
                            <>
                              {hasReviewedBooking(booking) ? (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="text-gray-500"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Review Submitted
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Leave Review
                                </Button>
                              )}
                            </>
                          )}
                          {/* Provider can review customer after completion */}
                          {isProvider && booking.status === 'completed' && (
                            <>
                              {hasReviewedBooking(booking) ? (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="text-gray-500"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Review Submitted
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <Star className="h-4 w-4 mr-1" />
                                  Review Customer
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/booking/${booking.id}`)}
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isProvider ? "Review Customer" : "Leave a Review"}
            </DialogTitle>
            <DialogDescription>
              {isProvider
                ? `Share your experience with ${selectedBooking?.customer_name || 'this customer'}.`
                : `Share your experience with ${selectedBooking?.provider_name || 'this provider'}.`}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <ReviewForm
              onSubmit={isProvider ? handleProviderReviewSubmit : async (data) => {
                await handleReviewSubmit(data);
                window.location.reload();
              }}
              providerName={
                isProvider
                  ? selectedBooking.customer_name || 'the customer'
                  : selectedBooking.provider_name || 'the provider'
              }
              serviceName={selectedBooking.service_title || 'this service'}
              disabled={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Review Modal */}
      <Dialog open={showEditReviewModal} onOpenChange={setShowEditReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
            <DialogDescription>
              Update your review for this booking.
            </DialogDescription>
          </DialogHeader>
          {editingReview && (
            <ReviewForm
              onSubmit={handleUpdateReview}
              providerName={selectedBooking?.provider_name || 'the provider'}
              serviceName={selectedBooking?.service_title || 'this service'}
              disabled={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function getStatusBadgeClass(status: string) {
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
}

