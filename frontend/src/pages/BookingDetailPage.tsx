import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService, reviewService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Calendar, Clock, MapPin, DollarSign, User, Star,
  MessageSquare, CheckCircle, XCircle, Loader2, ArrowLeft,
  Phone, Mail, AlertCircle, File
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '../components/review-form';

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  location?: string;
  phone?: string;
  email?: string;
}

interface User {
  id: number;
  email: string;
  profile?: Profile;
}

interface Quote {
  id: number;
  price: number;
  message?: string;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  description?: string;
}

interface Booking {
  id: number;
  quote_id: number;
  customer_id: number;
  provider_id: number;
  scheduled_time: string;
  status: string;
  created_at: string;
  quote?: Quote;
  customer?: User;
  provider?: User;
  listing?: Listing;
  has_review?: boolean;
}

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { isAuthenticated, userData } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookingData = async () => {
      if (!bookingId) return;

      setLoading(true);
      try {
        const data = await bookingService.getBookingById(Number(bookingId));

        if (!data || !data.id) {
          setError('Booking not found or access denied');
          setLoading(false);
          return;
        }

        setBooking(data);

        const isCustomerForBooking = userData?.id === data.customer_id;
        const isProviderForBooking = userData?.id === data.provider_id;

        if (!isCustomerForBooking && !isProviderForBooking) {
          navigate('/dashboard');
          return;
        }

        if (data.has_review) {
          try {
            // Fix: Properly handle the review data and ensure it's a valid Review object
            const reviewData = await reviewService.getBookingReview(data.id);
            if (reviewData && typeof reviewData === 'object') {
              setReview(reviewData);
            }
          } catch (err) {
            console.error("Error fetching review:", err);
            // Don't set error here as the booking data is still valid
          }
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, isAuthenticated, navigate, userData?.id]);

  const isBookingCustomer = booking && userData?.id === booking.customer_id;
  const isBookingProvider = booking && userData?.id === booking.provider_id;

  const handleUpdateStatus = async (newStatus: string) => {
    if (!booking) return;
    setStatusUpdating(true);
    try {
      await bookingService.updateBookingStatus(booking.id, newStatus);
      setBooking({ ...booking, status: newStatus });
    } catch {
      setError('Failed to update booking status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setStatusUpdating(true);
    try {
      await bookingService.updateBookingStatus(booking.id, 'cancelled');
      setBooking({ ...booking, status: 'cancelled' });
      setCancelDialogOpen(false);
    } catch {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReviewSubmit = async (reviewData: { rating: number; comment?: string }) => {
    if (!booking) return;
    try {
      const createdReview = await reviewService.createReview({
        booking_id: booking.id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      // Update booking to reflect that it has a review
      const updatedBooking = await bookingService.getBookingById(booking.id);
      setBooking(updatedBooking);
      
      // Set the review using the created review data if available,
      // otherwise fetch it from the server
      if (createdReview) {
        setReview(createdReview);
      } else {
        const fetchedReview = await reviewService.getBookingReview(booking.id);
        if (fetchedReview) {
          setReview(fetchedReview);
        }
      }
      
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError('Failed to submit review. Please try again.');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
  if (error) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!booking) return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Not Found</AlertTitle>
      <AlertDescription>Booking not found or access denied.</AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Booking #{booking.id} - {booking.listing?.title}</CardTitle>
          <Badge className={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
        </CardHeader>
        <CardContent>
          <p>Date: {formatDate(booking.scheduled_time)} - {formatTime(booking.scheduled_time)}</p>
          <p>Price: ${booking.quote?.price}</p>
        </CardContent>
        <CardFooter>
          {/* Provider Actions */}
          {isBookingProvider && booking.status === 'scheduled' && (
            <Button onClick={() => handleUpdateStatus('completed')} disabled={statusUpdating}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
            </Button>
          )}

          {/* Customer Actions */}
          {isBookingCustomer && (
            <>
              {booking.status === 'completed' && (
                <>
                  {booking.has_review ? (
                    <Button 
                      variant="outline"
                      disabled
                      className="text-gray-500"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Submitted
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Leave Review
                    </Button>
                  )}
                </>
              )}
              
              {booking.status === 'scheduled' && (
                <Button 
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={statusUpdating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this booking?</DialogDescription>
          </DialogHeader>
          <Label>Reason</Label>
          <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={statusUpdating}>
              <XCircle className="h-4 w-4 mr-2" /> Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <ReviewForm 
            onSubmit={handleReviewSubmit} 
            providerName={booking?.provider?.profile?.full_name || 'Unknown Provider'} 
            serviceName={booking?.listing?.title || 'Unknown Service'} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
