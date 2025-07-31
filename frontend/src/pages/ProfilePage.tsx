import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, listingService, requestService, bookingService, reviewService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Phone, Mail, Globe, Star, Edit, Briefcase, User, 

   ArrowLeft, ArrowRight, Menu, 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  hasReviewedBooking} from '@/pages/ProfileSidebar'
  import SidebarContent  from '@/pages/ProfileSidebar';
import OverviewTab from '@/pages/profile-tabs/OverviewTab';
import ServicesTab from '@/pages/profile-tabs/ServicesTab';
import RequestsTab from '@/pages/profile-tabs/RequestsTab';
import BookingsTab from '@/pages/profile-tabs/BookingsTab';
import ReviewsTab from '@/pages/profile-tabs/ReviewsTab';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Update interface to match actual API response
interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  location: string;
  phone: string;
  average_rating?: number;
  profile_picture?: string; // Add this line
  // Backend might not include the user object directly
}

interface User {
  id: number;
  email: string;
  role: string; // Changed from enum to string to be more flexible
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

// Add interfaces for customer-specific data
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
    profile?: {
      full_name: string;
    }
  };
}

interface Booking {
  id: number;
  quote_id: number;
  customer_id: number;
  provider_id: number;
  scheduled_time: string;
  status: string;
  created_at: string;
  has_review?: boolean; // Added this property
  provider?: {
    profile?: {
      full_name: string;
    }
  };
  listing?: {
    title: string;
  };
}

interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  // Additional fields to display listing info
  service_title?: string; 
  listing_id?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [uniqueClients, setUniqueClients] = useState<number>(0);

  const { isAuthenticated, isCustomer, isProvider } = useAuthContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching profile data...");
        
        // First, get the profile data
        const profileData = await profileService.getMyProfile();
        
        // Log the EXACT response for debugging
        console.log("Raw profile response:", JSON.stringify(profileData, null, 2));
        
        // Check if phone field is present
        if (!profileData.phone && profileData.phone_number) {
          // Fix field name mismatch if needed
          profileData.phone = profileData.phone_number;
        }
        
        // After potential fixes, set the state
        setProfile(profileData);
        
        // Handle user data - we need to ensure we have the correct email and role
        // Try to get user data directly from the backend - add this endpoint if needed
        try {
          const userData = await profileService.getCurrentUser();
          if (userData) {
            console.log("Got current user data:", userData);
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.role
            });
          } else if (profileData.user) {
            // If we already have user data in the profile response
            setUser(profileData.user);
            console.log("Using user data from profile:", profileData.user);
          } else {
            // Fallback to what we know from the profile data
            console.log("Creating minimal user object from profile data");
            setUser({
              id: profileData.user_id,
              email: "Unknown email", // Placeholder
              role: isProvider ? "provider" : "customer" // Use context values as fallback
            });
          }
        } catch (userErr) {
          console.error("Failed to get user data:", userErr);
          // Fallback to basic user info
          setUser({
            id: profileData.user_id,
            email: "Unknown email", // Placeholder
            role: isProvider ? "provider" : "customer" // Use context values as fallback
          });
        }
        
        // If the user is a customer, fetch their requests, bookings, and reviews they've written
        if (isCustomer) {
          try {
            const requestsData = await requestService.getMyRequests();
            setRequests(Array.isArray(requestsData) ? requestsData : []);
            console.log("Customer requests:", requestsData);
            
            // This would need to be implemented in the API service
            const bookingsData = await bookingService.getMyBookings();
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            console.log("Customer bookings:", bookingsData);
            
            // Use the appropriate method for customer reviews (reviews written by them)
            const reviewsData = await reviewService.getReviewsWrittenByMe();
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            console.log("Customer reviews written:", reviewsData);
          } catch (customerErr) {
            console.error("Error fetching customer data:", customerErr);
          }
        } 
        // If the user is a provider, fetch their listings, reviews, and completed bookings
        else if (isProvider) {
          try {
            const listingsData = await listingService.getMyListings();
            setListings(Array.isArray(listingsData) ? listingsData : []);
            console.log("Provider listings:", listingsData);
            
            // Use the appropriate method for provider reviews (reviews about them)
            const reviewsData = await reviewService.getReviewsAboutMe();
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            console.log("Provider reviews received:", reviewsData);
            
            // Fetch all bookings where this user is the provider and status is 'completed'
            const allBookings = await bookingService.getMyBookings?.();
            // Fallback: if not available, filter from all bookings
            let completed: Booking[] = [];
            if (Array.isArray(allBookings)) {
              completed = allBookings.filter(
                (b: Booking) => b.status === "completed"
              );
            } else {
              // fallback: try to fetch all bookings and filter
              const fallbackBookings = await bookingService.getMyBookings?.();
              if (Array.isArray(fallbackBookings)) {
                completed = fallbackBookings.filter(
                  (b: Booking) => b.status === "completed" && b.provider_id === profileData.user_id
                );
              }
            }
            setCompletedBookings(completed);

            // Calculate unique clients from completed bookings
            const clientIds = new Set(completed.map(b => b.customer_id));
            setUniqueClients(clientIds.size);
          } catch (providerErr) {
            console.error("Error fetching provider data:", providerErr);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isCustomer, isProvider, navigate]);

  // Add additional debugging for render conditions
  if (loading) {
    console.log("Rendering loading state:", { isAuthenticated, isCustomer });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-xl text-gray-600 dark:text-gray-300">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-red-500 mb-4">{t("error")}: {error}</div>
        <Button onClick={() => window.location.reload()}>{t("retry")}</Button>
      </div>
    );
  }

  if (!profile) {
    console.log("No profile data available");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-gray-600 dark:text-gray-300 mb-4">{t("no_profile_found")}</div>
        <Button onClick={() => navigate('/profile-setup')}>{t("create_profile")}</Button>
      </div>
    );
  }

  // Log what we're about to render
  console.log("Rendering profile page with data:", { profile, user, listings });

  // Replace isFreelancer with isProvider from context
  const isFreelancer = isProvider;

  console.log("User is provider:", isProvider, "Role:", user?.role);




  // Handler for editing a listing
  const handleEditListing = (listingId: number) => {
    navigate(`/listing/edit/${listingId}`); // Or use a dedicated edit page if you have one
  };

  // Handler for delete button click (opens confirmation dialog)
  const handleDeleteListing = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  // Handler for confirming deletion
  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      await listingService.deleteListing(listingToDelete.id);
      setListings((prev) => prev.filter((l) => l.id !== listingToDelete.id));
      toast.success('Listing deleted successfully');
    } catch (err) {
      toast.error('Failed to delete listing');
    } finally {
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  // Handler for canceling deletion
  const cancelDeleteListing = () => {
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 ${isRTL ? 'font-arabic' : ''}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
     {/* Mobile menu toggle */}
{!showMobileMenu && (
  <button
    className={`absolute  top-18 z-0 md:hidden bg-gray dark:bg-gray-850 p-3 transition-all duration-300 ${
      isRTL ? 'left-7' : 'right-6'
    }`}
    onClick={() => setShowMobileMenu(true)}
  >
    <Menu size={20} />
  </button>
)}

{/* Overlay for closing sidebar when clicking outside */}
{showMobileMenu && (
  
  <div
    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
    onClick={() => setShowMobileMenu(false)}
  />
)}

{/* Left Sidebar - Mobile */}
<div
  className={`fixed top-0 h-full w-[280px] bg-white dark:bg-gray-800 z-40 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden pt-24 pb-6 overflow-y-auto ${
    showMobileMenu 
      ? 'translate-x-0' 
      : isRTL 
        ? 'translate-x-full' 
        : '-translate-x-full'
  } ${isRTL ? 'right-0' : 'left-0'}`}
>
  <SidebarContent collapsed={false} isRTL={isRTL} />
</div>

      {/* Main layout wrapper */}
      <div className={`flex pt-14 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Left Sidebar - Desktop */}
        <div
          className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full ${
            sidebarCollapsed ? 'w-20' : 'w-55'
          } bg-white dark:bg-gray-950  dark:border-gray-700 transition-all duration-300 pt-24 hidden md:block `}
          style={isRTL ? { right: 0, left: 'auto', borderRight: 0 } : {}}
        >
          <div className={`px-4 mb-8 ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
             
              <button
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed
                  ? isRTL
                    ? <ArrowLeft size={20} />
                    : <ArrowRight size={20} />
                  : isRTL
                    ? <ArrowRight size={20} />
                    : <ArrowLeft size={20} />}
              </button>
            </div>
          </div>
          <SidebarContent collapsed={sidebarCollapsed} isRTL={isRTL} />
        </div>

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed
              ? isRTL
                ? 'md:mr-20'
                : 'md:ml-20'
              : isRTL
                ? 'md:mr-64'
                : 'md:ml-64'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 py-0 sm:px-6 lg:px-8">
            <div className="fade-in-up animate-fadeIn">
              {/* Profile Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6 transition-all duration-300 hover:shadow-md">
                <div className="relative">
                  {/* Cover image with animation */}
                  <div className="h-55 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 animate-gradientShift rounded-t-2xl"></div>
                  
                  {/* Avatar with pulsing animation on hover */}
                  <div className={`absolute -bottom-12 ${isRTL ? 'right-8' : 'left-8'}`}>
                    <div className="bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 rounded-full size-24 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 group overflow-hidden">
                      {profile?.profile_picture ? (
                        <img
                          src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${API_URL}${profile.profile_picture}`}
                          alt={profile.full_name}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : isFreelancer ? (
                        <Briefcase className="h-10 w-10 text-indigo-500 dark:text-indigo-400 transition-all duration-300 group-hover:text-indigo-600" />
                      ) : (
                        <User className="h-10 w-10 text-blue-500 dark:text-blue-400 transition-all duration-300 group-hover:text-blue-600" />
                      )}
                    </div>
                  </div>
                  
                  {/* Edit button */}
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <Button 
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      size="sm"
                      onClick={() => navigate('/profile/edit')}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t("edit_profile")}
                    </Button>
                  </div>
                </div>
                
                <div className="px-8 pt-16 pb-8">
                  <div className={`mb-12 flex flex-col md:flex-row justify-between md:items-end ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                    <div className={`${isRTL ? 'md:order-2' : ''}`}>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-300">
                          {profile?.full_name}
                        </h1>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:shadow-md">
                          {isProvider ? t("provider") : t("customer")}
                        </span>
                        {profile?.average_rating && (
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-current mr-1" />
                            <span className="font-medium">{profile.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
            
                    </div>
                    {/* Statistics section */}
                    <div
                      className={`flex gap-6 mt-4 md:mt-0 ${
                        isRTL ? 'flex-row-reverse md:justify-start md:order-1' : ''
                      }`}
                      style={isRTL ? { } : {}}
                    >
                      {isProvider ? (
                        isRTL ? (
                          // Arabic order: Rating | Clients | Completed Jobs
                          <>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">4.8</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("rating")}</div>
                            </div>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {uniqueClients}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("clients")}</div>
                            </div>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {completedBookings.length}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("completed_jobs")}</div>
                            </div>
                          </>
                        ) : (
                          // English order: Completed Jobs | Clients | Rating
                          <>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {completedBookings.length}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("completed_jobs")}</div>
                            </div>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                                {uniqueClients}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("clients")}</div>
                            </div>
                            <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">4.8</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{t("rating")}</div>
                            </div>
                          </>
                        )
                      ) : isRTL ? (
                        // Arabic order for customers: Rating | Clients | Projects
                        <>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">4.8</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("rating")}</div>
                          </div>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">36</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("clients")}</div>
                          </div>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">12</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("projects")}</div>
                          </div>
                        </>
                      ) : (
                        // English order for customers: Projects | Clients | Rating
                        <>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">12</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("projects")}</div>
                          </div>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">36</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("clients")}</div>
                          </div>
                          <div className="text-center transition-all duration-300 hover:transform hover:scale-105">
                            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">4.8</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{t("rating")}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
           
                  {/* Professional contact information section */}
                  <div className="bg-white dark:bg-slate-800 px-8 py-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors duration-200">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("email")}</div>
                          <div className="font-medium">{user?.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors duration-200">
                          <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("phone")}</div>
                          <div className="font-medium">
                            {profile?.phone || t("no_phone_number_provided", "Not provided")}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-full group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors duration-200">
                          <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("location")}</div>
                          <div className="font-medium">{profile?.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors duration-200">
                          <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("website")}</div>
                          <div className="font-medium">yourwebsite.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs Navigation with animation - Role-specific tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 transition-all duration-300 hover:shadow-md">
                <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4 overflow-x-auto scrollbar-hide">
                  {isProvider ? (
                    // Provider tabs
                    ['overview', 'services', 'activities'].map((tab) => (
                      <button 
                        key={tab}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeTab === tab 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {t(tab)}
                      </button>
                    ))
                  ) : (
                    // Customer tabs
                    ['requests', 'bookings', 'reviews'].map((tab) => (
                      <button 
                        key={tab}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeTab === tab 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {t(tab === "requests" ? "my_requests" : tab === "bookings" ? "my_bookings" : "my_reviews")}
                      </button>
                    ))
                 ) }
                </div>
              </div>
              
              {/* Tab Content with animation - Role-specific content */}
              <div className="transition-all duration-500 ease-in-out animate-fadeIn">
                {/* Provider content - only shown for providers */}
                {isProvider && (
                  <>
                    {activeTab === 'overview' && (
                      <OverviewTab profile={profile} />
                    )}
                    {activeTab === 'services' && (
                      <ServicesTab
                        listings={listings}
                        onEditListing={handleEditListing}
                        onDeleteListing={handleDeleteListing}
                        navigate={navigate}
                        t={t}
                      />
                    )}
                    {activeTab === 'activities' && (
                      // You can create an ActivitiesTab component similarly if needed
                      <div>{/* ...existing activities content... */}</div>
                    )}
                  </>
                )}

                {/* Customer content - only shown for customers */}
                {isCustomer && (
                  <>
                    {activeTab === 'requests' && (
                      <RequestsTab
                        requests={requests}
                        navigate={navigate}
                        t={t}
                      />
                    )}
                    {activeTab === 'bookings' && (
                      <BookingsTab
                        bookings={bookings}
                        navigate={navigate}
                        t={t}
                        hasReviewedBooking={(booking) => hasReviewedBooking(booking as any)}
                      />
                    )}
                    {activeTab === 'reviews' && (
                      <ReviewsTab
                        reviews={reviews}
                        navigate={navigate}
                        t={t}
                      />
                    )}
                  </>
                )}
              </div>
              
             
                 
            </div>
          </div>
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
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        title={t("delete_listing")}
        description={t("are_you_sure_you_want_to_delete", { title: listingToDelete?.title })}
        onCancel={cancelDeleteListing}
        onConfirm={confirmDeleteListing}
        confirmText={t("delete")}
        cancelText={t("cancel")}
      />
    </div>
  );
}

