import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService, listingService, reviewService } from '@/services/api';
import { 
  User, MapPin, Phone, Mail, Star, Briefcase, 
  Calendar, ArrowLeft, ExternalLink, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  location: string;
  phone: string;
  average_rating?: number;
  profile_picture?: string; // Add this line
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface Listing {
  id: number;
  title: string;
  description?: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
}

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  service_title?: string; // Add this missing property
  listing_id?: number;    // Add this missing property
}

export default function UserProfilePageV2() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Fetch user profile data
        const profileData = await profileService.getProfileById(userId);
        setProfile(profileData);
        
        // If the user is a provider, fetch their listings and reviews ABOUT them
        if (profileData.user?.role === 'provider') {
          const [listingsData, reviewsData] = await Promise.all([
            listingService.getListingsByUserId(userId),
            // For providers, get reviews where they are the reviewee
            reviewService.getReviewsAboutUser(parseInt(userId))
          ]);
          
          setListings(listingsData);
          setReviews(reviewsData);
        } else {
          // If the user is a customer, fetch reviews WRITTEN BY them (testimonials)
          const customerReviews = await reviewService.getCustomerReviews(parseInt(userId));
          setReviews(customerReviews);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-t-xl mb-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Profile not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  const isProvider = profile.user?.role === 'provider';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="absolute -bottom-16 left-8">
            <div className="bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 rounded-full size-32 flex items-center justify-center overflow-hidden">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${API_URL}${profile.profile_picture}`}
                  alt={profile.full_name}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : isProvider ? (
                <Briefcase className="h-14 w-14 text-blue-500 dark:text-blue-400" />
              ) : (
                <User className="h-14 w-14 text-blue-500 dark:text-blue-400" />
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name}
                </h1>
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                  {isProvider ? 'Provider' : 'Customer'}
                </Badge>
                
                {profile.average_rating !== undefined && profile.average_rating > 0 && (
                  <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="font-medium">{profile.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {isProvider ? 'Professional Service Provider' : 'Customer'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button>Contact</Button>
            </div>
          </div>
          
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                {isProvider && <TabsTrigger value="services">Services</TabsTrigger>}
                <TabsTrigger value="reviews">
                  {isProvider ? "Reviews" : "Testimonials"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {profile.bio && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h2>
                        <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
                      </div>
                    )}
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h2>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <MapPin className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                          <span>{profile.location}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Phone className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                          <span>{profile.phone}</span>
                        </div>
                        
                        {profile.user?.email && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Mail className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                            <span>{profile.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {/* Show average rating if provider */}
                    {isProvider && profile.average_rating !== undefined && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Average Rating</h2>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-6 w-6 ${
                                  star <= Math.round(profile.average_rating || 0)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-lg font-medium">
                            {profile.average_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {isProvider ? 'Member Since' : 'Customer Since'}
                      </h2>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Calendar className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                        <span>January 2023</span> {/* This would be dynamic in real implementation */}
                      </div>
                    </div>
                    
                    {isProvider && profile.average_rating !== undefined && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rating</h2>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-6 w-6 ${
                                  star <= Math.round(profile.average_rating || 0)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-lg font-medium">
                            {profile.average_rating.toFixed(1)}
                          </span>
                          <span className="ml-1 text-gray-500">({reviews.length} reviews)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {isProvider && (
                <TabsContent value="services" className="mt-6">
                  <div className="mb-3 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Services Offered</h2>
                  </div>
                  
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.map(listing => (
                        <Link 
                          key={listing.id} 
                          to={`/listings/${listing.id}`}
                          className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{listing.title}</h3>
                              {listing.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                                  {listing.description}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                              ${listing.min_price} - ${listing.max_price}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {listing.location}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">No services listed yet</p>
                    </div>
                  )}
                </TabsContent>
              )}
              
              <TabsContent value="reviews" className="mt-6">
                <div className="mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isProvider ? "Customer Reviews" : "Reviews by this Customer"}
                  </h2>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-full size-10 flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                {isProvider ? (
                                  <Link 
                                    to={`/profile/${review.reviewer_id}`}
                                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    {review.reviewer_name || 'Customer'}
                                  </Link>
                                ) : (
                                  <div className="font-medium">For: {review.service_title || 'Service'}</div>
                                )}
                                <div className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex">
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
                            </div>
                          </div>
                          
                          {review.service_title && (
                            <div className="mb-2 flex items-center">
                              <Badge variant="outline">{review.service_title}</Badge>
                            </div>
                          )}
                          
                          {review.comment && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                              <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                            </div>
                          )}
                          
                          {/* Add link to listing if we have a listing_id */}
                          {!isProvider && review.listing_id && (
                            <div className="mt-4 flex justify-end">
                              <Link to={`/listings/${review.listing_id}`}>
                                <Button size="sm" variant="outline" className="flex items-center gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  View Service
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">
                      {isProvider ? "No reviews yet" : "This customer hasn't left any reviews yet"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
