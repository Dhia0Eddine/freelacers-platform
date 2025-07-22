import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, User, Calendar, Clock, MapPin, FileText, 
  DollarSign, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookingForm } from '../components/booking-form';

interface Quote {
  id: number;
  request_id: number;
  listing_id: number;
  provider_id: number;
  price: number;
  message: string;
  status: string;
  created_at: string;
  expiry_date: string;
  provider_name?: string;
  listing_title?: string;
}

interface Request {
  id: number;
  listing_id: number;
  description?: string;
  location?: string;
  preferred_date: string;
  status: string;
  created_at: string;
}

export default function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const { isAuthenticated, isCustomer } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      navigate('/dashboard');
      return;
    }
    
    const fetchQuoteData = async () => {
      if (!quoteId) return;
      
      setLoading(true);
      try {
        // Fetch the quote details
        const quoteData = await requestService.getQuoteById(Number(quoteId));
        setQuote(quoteData);
        
        // Fetch the associated request
        if (quoteData.request_id) {
          const requestData = await requestService.getRequestById(quoteData.request_id);
          setRequest(requestData);
        }
      } catch (err) {
        console.error('Error fetching quote data:', err);
        setError('Failed to load quote details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuoteData();
  }, [quoteId, isAuthenticated, isCustomer, navigate]);

  const handleAcceptQuote = async () => {
    if (!quote) return;
    
    try {
      await requestService.updateQuoteStatus(quote.id, 'accepted');
      
      // Update the quote status locally
      setQuote({ ...quote, status: 'accepted' });
      
      // Show the booking form
      setShowBookingForm(true);
    } catch (err) {
      console.error('Error accepting quote:', err);
      setError('Failed to accept quote. Please try again.');
    }
  };

  const handleDeclineQuote = async () => {
    if (!quote) return;
    
    try {
      await requestService.updateQuoteStatus(quote.id, 'rejected');
      
      // Update the quote status locally
      setQuote({ ...quote, status: 'rejected' });
      
      // Navigate back to the dashboard
      navigate('/dashboard/quotes');
    } catch (err) {
      console.error('Error declining quote:', err);
      setError('Failed to decline quote. Please try again.');
    }
  };

  const handleBookingCreated = () => {
    // Navigate to the dashboard bookings tab
    navigate('/dashboard/bookings');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/dashboard/quotes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>This quote doesn't exist or you don't have permission to view it.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/dashboard/quotes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/dashboard/quotes')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quotes
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote Details Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Quote Details</CardTitle>
                <CardDescription>Quote #{quote.id}</CardDescription>
              </div>
              <Badge className={getStatusBadgeClass(quote.status)}>
                {quote.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Service</h3>
              <p className="text-gray-900 dark:text-white font-medium">
                {quote.listing_title || 'Service Quote'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Provider</h3>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span>{quote.provider_name || 'Service Provider'}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Price</h3>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-xl font-semibold text-green-600 dark:text-green-400">${quote.price}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Message from Provider</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                {quote.message || 'No message provided'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Valid Until</h3>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span>{new Date(quote.expiry_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          
          {quote.status === 'pending' && (
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleDeclineQuote}
              >
                Decline Quote
              </Button>
              <Button 
                onClick={handleAcceptQuote}
              >
                Accept Quote
              </Button>
            </CardFooter>
          )}
          
          {quote.status === 'accepted' && !showBookingForm && (
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => setShowBookingForm(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Booking
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Request Details or Booking Form */}
        <div>
          {showBookingForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Your Booking</CardTitle>
                <CardDescription>
                  Select a date and time for your service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm 
                  quoteId={quote.id} 
                  preferredDate={request?.preferred_date ? new Date(request.preferred_date) : undefined}
                  onSuccess={handleBookingCreated}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Original service request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {request ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {request.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Preferred Date</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{new Date(request.preferred_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {request.location && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{request.location}</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Request Date</h3>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Request details not available</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}
