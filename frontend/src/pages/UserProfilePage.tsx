import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { profileService, listingService, requestService, bookingService, reviewService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Phone, Mail, Globe, Star, Briefcase, User, 
  CheckCircle, XCircle, MessageSquare, ArrowLeft, Calendar,
  Share2, Bookmark, Flag
} from 'lucide-react';

// Same interfaces as ProfilePage

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  location: string;
  phone: string;
  average_rating?: number;
}


interface User {
  id: number;
  email: string;
  role: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
}

// Add review interface
interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  service_title?: string;
  listing_id?: number;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('services');
  
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching profile data for user ${userId}...`);
        
        // Fetch the profile data for the specified user
        const profileData = await profileService.getProfileById(userId);
        console.log("Profile data received:", profileData);
        setProfile(profileData);
        
        // Set user data if included in the response
        if (profileData.user) {
          setUser(profileData.user);
          console.log("User data from profile:", profileData.user);
        } else {
          // Create a basic user object if not included in the response
          const defaultUserData = {
            id: profileData.user_id,
            email: "",  // We might not have this information
            role: "unknown"  // Set a default role that we'll update later
          };
          setUser(defaultUserData);
          console.log("Created default user data:", defaultUserData);
        }
        
        // Always try to fetch listings regardless of role
        try {
          console.log(`Fetching listings for user ${userId}...`);
          const listingsData = await listingService.getListingsByUserId(userId);
          console.log("Listings data received:", listingsData, "length:", listingsData?.length);
          setListings(Array.isArray(listingsData) ? listingsData : []);
          
          // If we have listings, this is likely a provider
          // Update the user role if we created a default user above
          if (listingsData && listingsData.length > 0 && (!profileData.user || !profileData.user.role)) {
            setUser(prevUser => ({
              ...(prevUser || { id: profileData.user_id, email: "" }),
              role: "provider"  // Infer role from presence of listings
            }));
            console.log("Updated user role to provider based on listings");
          }
        } catch (listingErr) {
          console.error("Error fetching listings:", listingErr);
          setListings([]);
        }
        
        // Fetch reviews based on actual user role from profile data
        try {
          // Get the user role directly from the profile data
          const userRole = profileData.user?.role;
          console.log("Determining user role for reviews:", userRole);
          
          if (userRole === "provider") {
            // For providers, get reviews ABOUT them
            const reviewsData = await reviewService.getReviewsAboutUser(parseInt(userId));
            setReviews(reviewsData);
            console.log("Provider reviews received:", reviewsData);
          } else {
            // For customers or unknown roles, get reviews WRITTEN BY them
            const testimonials = await reviewService.getCustomerReviews(parseInt(userId));
            setReviews(testimonials);
            console.log("Customer testimonials received:", testimonials);
          }
        } catch (reviewErr) {
          console.error("Error fetching reviews:", reviewErr);
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading profile...</div>
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

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300 mb-4">Profile not found.</div>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    );
  }

  // Update the isFreelancer logic to not use "freelancer" string
  const isFreelancer = user?.role === 'freelancer' || user?.role === 'provider' || (listings && listings.length > 0);

  // Mock data for testimonials
  const testimonials = [
    { id: 1, name: 'Jane Cooper', role: 'Marketing Director', text: 'Exceptional service and attention to detail. Would highly recommend!', avatar: '👩🏽‍💼' },
    { id: 2, name: 'Robert Fox', role: 'CTO', text: 'Delivered above and beyond our expectations. Very professional.', avatar: '👨🏻‍💻' }
  ];

  // Update the testimonials section to use actual reviews data
  const renderTestimonialsSection = () => {
    const isCustomer = !isFreelancer;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {isFreelancer ? "Customer Reviews" : "Testimonials"}
        </h2>
        
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, index) => (
              <div 
                key={review.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full size-10 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="ml-4">
                    {isFreelancer ? (
                      <>
                        <Link 
                          to={`/profile/${review.reviewer_id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {review.reviewer_name || 'Customer'}
                        </Link>
                        <div className="flex mt-1">
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
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          For: {review.service_title || 'Service'}
                        </h3>
                        <div className="flex mt-1">
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
                      </>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 dark:text-gray-300 italic">"{review.comment}"</p>
                )}
                
                {/* Add link to listing for customer testimonials */}
                {!isFreelancer && review.listing_id && (
                  <div className="mt-4 flex justify-end">
                    <Link to={`/listings/${review.listing_id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        View Service
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {isFreelancer ? "No reviews yet." : "No testimonials yet."}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 transition-all duration-300">
      <div className="container mx-auto max-w-5xl">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 mb-6 group transition-all duration-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      
        {/* Profile Header - Modernized */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8 transition-all duration-300 hover:shadow-md animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 animate-gradientShift h-48 relative">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {isAuthenticated && (
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-300"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="px-8 py-6 flex flex-col md:flex-row relative">
            {/* Profile Avatar */}
            <div className="flex-shrink-0 -mt-20 mb-6 md:mb-0">
              <div className="bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 rounded-full h-28 w-28 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 group">
                {isFreelancer ? (
                  <Briefcase className="h-12 w-12 text-blue-500 dark:text-blue-400 transition-all duration-300 group-hover:text-blue-600" />
                ) : (
                  <User className="h-12 w-12 text-blue-500 dark:text-blue-400 transition-all duration-300 group-hover:text-blue-600" />
                )}
              </div>
            </div>
            
            <div className="flex-1 md:ml-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile?.full_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {isFreelancer ? 'Professional Service Provider' : 'Client'}
                  </p>
                </div>
                
                <div className="flex items-center mt-4 md:mt-0 space-x-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                  <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-md">
                    {isFreelancer ? 'Provider' : 'Customer'}
                  </span>
                  
                  {profile?.average_rating && (
                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span className="font-medium">{profile.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                {user?.email && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                    <Mail className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{user.email}</span>
                  </div>
                )}
                
                {profile?.phone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                    <Phone className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                  <MapPin className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                  <span>{profile?.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                  <Globe className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400" />
                  <span>View website</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex mt-6 space-x-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {listings?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Services</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Projects</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor((profile?.average_rating || 4) * 20)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Sections Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 transition-all duration-300 hover:shadow-md animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === 'about' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveSection('about')}
            >
              About
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === 'services' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveSection('services')}
            >
              Services
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === 'testimonials' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveSection('testimonials')}
            >
              Testimonials
            </button>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="animate-fadeIn" style={{ animationDelay: '0.7s' }}>
          {/* About Section */}
          {activeSection === 'about' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">About</h2>
              
              {profile?.bio ? (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No bio information provided.</p>
                </div>
              )}
              
              {/* Additional about information */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
                  <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-3">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                    Availability
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Monday to Friday, 9:00 AM - 5:00 PM
                  </p>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
                  <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-white mb-3">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                    Experience
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    5+ years of professional experience
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Services Section */}
          {activeSection === 'services' && (
            <>
              {listings && listings.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Services</h2>
                  
                  <div className="space-y-6">
                    {listings.map((listing, index) => (
                      <div 
                        key={listing.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {listing.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {listing.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-3 mb-4">
                              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                ${listing.min_price} - ${listing.max_price}
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                <MapPin className="h-3 w-3 mr-1" />
                                {listing.location}
                              </div>
                              {listing.available ? (
                                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Available
                                </div>
                              ) : (
                                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm flex items-center">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unavailable
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                          >
                            Request Service
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isFreelancer ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 transition-all duration-300 hover:shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Services</h2>
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services listed yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      This provider hasn't added any services to their profile yet.
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          )}
          
          {/* Testimonials Section - Update to use the new function */}
          {activeSection === 'testimonials' && renderTestimonialsSection()}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-gradientShift {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
