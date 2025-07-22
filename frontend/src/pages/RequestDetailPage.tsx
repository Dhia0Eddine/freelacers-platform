import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, User, Calendar, Clock, MapPin, FileText, 
  DollarSign, SendHorizontal, Loader2, Check, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Request {
  id: number;
  user_id: number;
  listing_id: number;
  description?: string;
  location?: string;
  preferred_date: string;
  status: string;
  created_at: string;
  listing?: {
    title?: string;
    min_price?: number;
    max_price?: number;
  };
  user?: {
    id?: number;
    email?: string;
    profile?: {
      id?: number;
      full_name?: string;
      location?: string;
      phone?: string;
    }
  };
}

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState<number | ''>('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { isAuthenticated, isProvider } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isProvider) {
      navigate('/dashboard');
      return;
    }
    
    const fetchRequestData = async () => {
      if (!requestId) return;
      
      setLoading(true);
      try {
        const data = await requestService.getRequestById(Number(requestId));
        console.log("Request data received:", data);
        setRequest(data);
        
        // Set initial quote price to the midpoint of the listing price range
        if (data?.listing?.min_price !== undefined && data?.listing?.max_price !== undefined) {
          const midPrice = (data.listing.min_price + data.listing.max_price) / 2;
          setQuotePrice(Math.round(midPrice));
        }
      } catch (err) {
        console.error('Error fetching request:', err);
        setError('Failed to load request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestData();
  }, [requestId, isAuthenticated, isProvider, navigate]);

  const handleSubmitQuote = async () => {
    if (!isAuthenticated || !isProvider || !request) {
      return;
    }
    
    if (!quotePrice) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!quoteMessage.trim()) {
      setError('Please enter a message for the customer');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await requestService.submitQuote({
        request_id: request.id,
        listing_id: request.listing_id,
        price: Number(quotePrice),
        message: quoteMessage
      });
      
      setSuccess(true);
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError('Failed to submit quote. Please try again.');
    } finally {
      setSubmitting(false);
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
          <Button onClick={() => navigate('/dashboard')}>
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

  // Get the service title safely with a fallback
  const serviceTitle = request.listing?.title || 'Service Request';

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request Details Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{serviceTitle}</CardTitle>
                  <CardDescription>Request #{request.id}</CardDescription>
                </div>
                <Badge className={getStatusBadgeClass(request.status)}>
                  {request.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Request Details</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {request.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer</h3>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    {request.user_id ? (
                      <Link 
                        to={`/profile/${request.user_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        {request.user?.profile?.full_name || `Customer #${request.user_id}`}
                        <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                      </Link>
                    ) : (
                      <span>Unknown Customer</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preferred Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{new Date(request.preferred_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Request Date</h3>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {request.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location</h3>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{request.location}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Service Price Range</h3>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span>
                    {request.listing?.min_price !== undefined && request.listing?.max_price !== undefined 
                      ? `$${request.listing.min_price} - $${request.listing.max_price}`
                      : 'Price range not specified'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quote Form Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Send a Quote</CardTitle>
              <CardDescription>
                Provide your price and message to the customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success ? (
                <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <AlertDescription>Quote sent successfully!</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Price ($)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter your price"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value ? Number(e.target.value) : '')}
                        min={request.listing?.min_price || 0}
                        max={(request.listing?.max_price || 0) * 1.5} // Allow some flexibility above max
                        disabled={submitting}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {request.listing?.min_price !== undefined && request.listing?.max_price !== undefined 
                          ? `Suggested range: $${request.listing.min_price} - $${request.listing.max_price}`
                          : 'Enter a competitive price for your services'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Message to Customer
                      </label>
                      <Textarea
                        placeholder="Describe what you'll provide, timelines, and any other details..."
                        value={quoteMessage}
                        onChange={(e) => setQuoteMessage(e.target.value)}
                        className="min-h-32"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleSubmitQuote}
                disabled={submitting || success || request.status !== 'open'}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4 mr-2" />
                    Send Quote
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
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
