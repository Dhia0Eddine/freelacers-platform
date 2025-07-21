import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, User, Calendar, Clock, MapPin, FileText, 
  DollarSign, Loader2, Check, AlertCircle, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BookingFormModal } from '../components/booking-form-modal';

interface Quote {
  id: number;
  request_id: number;
  price: number;
  description: string;
  provider_name: string;
  status: string;
  created_at: string;
  expiry_date: string;
}

interface Request {
  id: number;
  listing_id: number;
  description?: string;
  location?: string;
  preferred_date: string;
  status: string;
  created_at: string;
  listing?: {
    title: string;
    min_price: number;
    max_price: number;
  };
  provider_name?: string;
}

export default function MyRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<Request | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { isAuthenticated, isCustomer } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      navigate('/dashboard');
      return;
    }
    
    const fetchRequestData = async () => {
      if (!requestId) return;
      
      setLoading(true);
      try {
        // Fetch the request details
        const requestData = await requestService.getRequestById(Number(requestId));
        setRequest(requestData);
        
        // Fetch quotes for this request
        const quotesData = await requestService.getQuotesForRequest(Number(requestId));
        setQuotes(quotesData);
      } catch (err) {
        console.error('Error fetching request data:', err);
        setError('Failed to load request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestData();
  }, [requestId, isAuthenticated, isCustomer, navigate]);

  const handleQuoteAction = async (quoteId: number, action: 'accept' | 'decline') => {
    try {
      await requestService.updateQuoteStatus(quoteId, action === 'accept' ? 'accepted' : 'rejected');
      
      // Update the quotes list with the new status
      setQuotes(quotes.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: action === 'accept' ? 'accepted' : 'rejected' } 
          : quote
      ));
      
      // If accepting, set this as the selected quote for booking
      if (action === 'accept') {
        const quote = quotes.find(q => q.id === quoteId) || null;
        setSelectedQuote(quote);
        setShowBookingModal(true);
      }
    } catch (err) {
      console.error(`Error ${action}ing quote:`, err);
      setError(`Failed to ${action} quote. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/dashboard/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>This request doesn't exist or you don't have permission to view it.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/dashboard/requests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
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
        onClick={() => navigate('/dashboard/requests')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Requests
      </Button>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request Details Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>Request #{request.id}</CardDescription>
                </div>
                <Badge className={getStatusBadgeClass(request.status)}>
                  {request.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Service</h3>
                <p className="text-gray-900 dark:text-white font-medium">
                  {request.listing?.title || 'Unknown Service'}
                </p>
              </div>
              
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
              
              {request.provider_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Provider</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{request.provider_name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Quotes Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quotes Received</CardTitle>
              <CardDescription>
                {quotes.length > 0 
                  ? `You have received ${quotes.length} quote${quotes.length > 1 ? 's' : ''} for this request`
                  : 'No quotes received yet for this request'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotes.length > 0 ? (
                <div className="space-y-6">
                  {quotes.map((quote) => (
                    <div 
                      key={quote.id}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-medium mb-1">{quote.provider_name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>Sent on {new Date(quote.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                            ${quote.price}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {quote.description || 'No message provided'}
                      </p>
                      
                      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
                        <div className="text-sm text-gray-500">
                          {quote.status === 'pending' ? (
                            <span>Valid until: {new Date(quote.expiry_date).toLocaleDateString()}</span>
                          ) : (
                            <Badge 
                              className={
                                quote.status === 'accepted' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }
                            >
                              {quote.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        {quote.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                              onClick={() => handleQuoteAction(quote.id, 'decline')}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleQuoteAction(quote.id, 'accept')}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        )}
                        
                        {quote.status === 'accepted' && !request.status.includes('booked') && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowBookingModal(true);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quotes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Providers have not sent any quotes for this request yet. Check back later or try updating your request details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedQuote && (
        <BookingFormModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          quote={selectedQuote}
          requestId={request.id}
          preferredDate={new Date(request.preferred_date)}
        />
      )}
    </div>
  );
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'quoted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'booked':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}
