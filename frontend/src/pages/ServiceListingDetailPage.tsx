import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Star, User, MessageSquare, Calendar, 
  DollarSign, Tag, Briefcase, CheckCircle, XCircle, 
  Phone, Mail, Clock, ArrowLeft, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { RequestFormModal } from '@/components/request-form-modal';
import { requestService } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  location?: string;
  phone?: string;
  average_rating?: number;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
  user_id: number;
  service_id: number;
  created_at: string;
  average_rating?: number;
  profile?: Profile;
}

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  service_name?: string;
}

export default function ServiceListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  
  const { isAuthenticated, isCustomer } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!listingId) {
      navigate('/listings');
      return;
    }

    const fetchListingData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching listing data for listing ${listingId}...`);
        
        const listingData = await listingService.getListingById(listingId);
        console.log("Listing data received:", listingData);
        
        // Debug logging to check profile data
        if (listingData.profile) {
          console.log("Profile data included:", listingData.profile);
        } else {
          console.warn("No profile data included with listing");
        }
        
        setListing(listingData);
      } catch (err) {
        console.error('Error fetching listing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listing data');
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [listingId, navigate]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Add a new useEffect to fetch reviews for the listing
  useEffect(() => {
    const fetchReviews = async () => {
      if (!listing?.id) return;
      
      setReviewsLoading(true);
      setReviewsError(null);
      
      try {
        // Fetch reviews for this listing
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reviews/listing/${listing.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        console.log("Listing reviews:", data);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviewsError("Couldn't load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [listing?.id]);

  const handleRequestSubmit = async (formData: {
    description: string;
    location: string;
    preferred_date: string;
  }) => {
    if (!isAuthenticated || !isCustomer) {
      setErrorMessage('Only customers can send service requests');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!listing?.id) {
        setErrorMessage('Listing ID is missing. Cannot send request.');
        return;
      }

      const requestData = {
        listing_id: listing.id,
        description: formData.description || undefined,
        location: formData.location || undefined,
        preferred_date: formData.preferred_date
      };

      await requestService.createRequest(requestData);
      
      setSuccessMessage('Request sent successfully!');
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading listing details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 mb-4">Listing not found.</div>
        <Button onClick={() => navigate('/listings')}>Browse Listings</Button>
      </div>
    );
  }

  // Add this function to safely get the provider name
  const getProviderName = () => {
    if (listing?.profile?.full_name) {
      return listing.profile.full_name;
    }
    return 'Service Provider';
  };

  // Service categories mapping
  const serviceCategories = {
    1: "Web Development",
    2: "Graphic Design",
    3: "Digital Marketing",
    4: "Content Writing",
    5: "Video Editing"
  };
  
  // Mock data for tags
  const mockTags = ["Remote", "Freelance", "Part-time", "Expert"];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2" 
              onClick={() => setErrorMessage(null)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 animate-fade-in">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 dark:text-gray-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </div>
        
        {/* Listing Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 px-8 flex items-end">
            <h1 className="text-2xl font-bold text-white pb-6">{listing.title}</h1>
          </div>
          
          <div className="p-8">
            <div className="flex flex-wrap gap-4 items-center text-sm mb-6">
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full">
                <DollarSign className="h-4 w-4 mr-1" />
                ${listing.min_price} - ${listing.max_price}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-1" />
                Listed on {new Date(listing.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex items-center">
                {listing.available ? (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Available
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4 mr-1" />
                    Unavailable
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {listing.description}
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Category</h2>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {serviceCategories[listing.service_id as keyof typeof serviceCategories] || "Miscellaneous"}
                </span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {mockTags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Information - Updated to handle profile data properly */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Service Provider</h2>
          
          <div className="flex items-start gap-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full size-16 flex-shrink-0 flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getProviderName()}
                  </h3>
                  
                  {(listing.profile?.average_rating || listing.average_rating) && (
                    <div className="flex items-center text-yellow-500 mt-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {((listing.profile?.average_rating ?? listing.average_rating) ?? 0).toFixed(1)} Rating
                      </span>
                    </div>
                  )}
                </div>
                
                <Link 
                  to={`/profile/${listing.user_id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  View Full Profile
                </Link>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Professional service provider specializing in {serviceCategories[listing.service_id as keyof typeof serviceCategories] || "various services"}.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && isCustomer && (
                  <>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setShowRequestModal(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                    
                    <Button variant="outline">
                      Contact Provider
                    </Button>
                  </>
                )}
                
                {isAuthenticated && !isCustomer && (
                  <div className="text-amber-600 dark:text-amber-400 flex items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Info className="h-4 w-4 mr-2" />
                    Only customers can send service requests
                  </div>
                )}
                
                {!isAuthenticated && (
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => navigate('/login?redirect=' + encodeURIComponent(`/listings/${listing.id}`))}>
                    Sign in to request this service
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section - Add this new section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
          
          {reviewsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : reviewsError ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              {reviewsError}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-full size-10 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        {review.reviewer_id ? (
                          <Link 
                            to={`/profile/${review.reviewer_id}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {review.reviewer_name || 'Customer'}
                          </Link>
                        ) : (
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {review.reviewer_name || 'Customer'}
                          </h3>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </div>
                  
                  {review.service_name && (
                    <div className="mb-2">
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                        {review.service_name}
                      </span>
                    </div>
                  )}
                  
                  {review.comment && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                This service hasn't received any reviews yet. Be the first to book and review!
              </p>
            </div>
          )}
        </div>
        
        {/* Similar Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Similar Services</h2>
            <Button 
              variant="ghost" 
              className="text-indigo-600 dark:text-indigo-400"
              onClick={() => navigate('/listings')}
            >
              View All
            </Button>
          </div>
          
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Similar services will be shown here based on category and location.
          </div>
        </div>
      </div>
      
      {/* Add the RequestFormModal component */}
      {listing && (
        <RequestFormModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestSubmit}
          listingTitle={listing.title}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
