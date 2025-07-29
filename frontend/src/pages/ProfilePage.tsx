import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileService, listingService, requestService, bookingService, reviewService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Phone, Mail, Globe, Star, Edit, Plus, Briefcase, User, 
  CheckCircle, XCircle, Home, BarChart2, Calendar, Users, Settings,
  FileText, MessageSquare, Code, ArrowLeft, ArrowRight, Menu, X, Clock, Badge, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from "react-i18next";

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

  const { isAuthenticated, isCustomer, isProvider,userRole } = useAuthContext();
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

  // Mock data for the dashboard
  const mockActivities = [
    { id: 1, action: 'Updated profile', date: '2 hours ago' },
    { id: 2, action: 'Added a new service', date: 'Yesterday' },
    { id: 3, action: 'Completed a project', date: '3 days ago' },
  ];

  const mockConnections = [
    { id: 1, name: 'Alex Johnson', role: 'Designer', avatar: '👨🏽‍💼' },
    { id: 2, name: 'Sarah Miller', role: 'Developer', avatar: '👩🏻‍💻' },
    { id: 3, name: 'James Brown', role: 'Marketing', avatar: '👨🏾‍💼' },
  ];




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
                  <div className={`flex flex-col md:flex-row justify-between md:items-end ${isRTL ? 'md:flex-row-reverse' : ''}`}>
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
                      <p className="text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300">
                        {t("professional_web_developer")}
                      </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                      <Mail className="h-5 w-5 mr-5 ml-5 text-blue-500 dark:text-blue-400" />
                      <span>{user?.email}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                      <Phone className="h-5 w-5 mr-5 ml-5  text-blue-500 dark:text-blue-400" />
                      <span>
                        {profile?.phone || t("no_phone_number_provided", "No phone number provided")}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                      <MapPin className="h-5 w-5 mr-5 ml-5 text-blue-500 dark:text-blue-400" />
                      <span>{profile?.location}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-500">
                      <Globe className="h-5 w-5 mr-5 ml-5 text-blue-500 dark:text-blue-400"  />
                      <span>yourwebsite.com</span>
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
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-2/3 space-y-6">
                          {/* Bio Section */}
                          {(isFreelancer || profile?.bio) && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("about_me")}</h2>
                              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                {profile?.bio || t("default_bio")}
                              </p>
                            </div>
                          )}
                          
                       
                          
                        </div>
                        
                        <div className="w-full lg:w-1/3 space-y-6">
                          {/* Latest Updates */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("latest_updates")}</h2>
                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Platform v2.0</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Released 2 days ago</p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-xs h-8">
                                    View
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-300 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Mobile App</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon</p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-xs h-8">
                                    Preview
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'services' && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("my_services")}</h2>
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                            onClick={() => navigate('/listings/new')}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("add_new_listing")}
                          </Button>
                        </div>
                        
                        {/* Show listings if we have them */}
                        {listings && listings.length > 0 ? (
                          <div className="space-y-4">
                            {listings.map((listing, index) => (
                              <div 
                                key={listing.id} 
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{listing.description}</p>
                                  </div>
                                  <div className="flex items-center">
                                    {listing.available ? (
                                      <span className="flex items-center text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        {t("available")}
                                      </span>
                                    ) : (
                                      <span className="flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        {t("unavailable")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mt-3">
                                  <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                                    ${listing.min_price} - ${listing.max_price}
                                  </div>
                                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {listing.location}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end mt-4 space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                    onClick={() => handleEditListing(listing.id)}
                                  >
                                    {t("edit")}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 transition-all duration-300"
                                    onClick={() => handleDeleteListing(listing)}
                                  >
                                    {t("delete")}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-3 animate-bounce" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("no_services_listed_yet")}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                              {t("start_offering_services")}
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                              onClick={() => navigate('/listings/new')}
                            >
                              {t("create_your_first_service")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'activities' && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("recent_activities")}</h2>
                        <div className="space-y-4">
                          {mockActivities.map((activity, index) => (
                            <div 
                              key={activity.id} 
                              className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full p-2 mr-4 shadow-md">
                                <div className="text-white">
                                  <Calendar className="h-5 w-5" />
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-900 dark:text-white font-medium">{activity.action}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{activity.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Customer content - only shown for customers */}
                {isCustomer && (
                  <>
                    {activeTab === 'requests' && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("my_service_requests")}</h2>
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                            onClick={() => navigate('/listings')}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("find_services")}
                          </Button>
                        </div>
                        
                        {/* Show requests if we have them */}
                        {requests && requests.length > 0 ? (
                          <div className="space-y-4">
                            {requests.map((request, index) => (
                              <div 
                                key={request.id} 
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {request.listing?.title || 'Service Request'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                      {request.description || t("no_description_provided")}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`badge ${getStatusBadgeVariant(request.status)}`}>
                                      {request.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mt-3">
                                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(request.preferred_date).toLocaleDateString()}
                                  </div>
                                  {request.location && (
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {request.location}
                                    </div>
                                  )}
                                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTimeAgo(request.created_at)}
                                  </div>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <User className="h-4 w-4 mr-2" />
                                    Provider: {request.listing?.profile?.full_name || t("unknown_provider")}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3 animate-bounce" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("no_service_requests_yet")}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                              {t("browse_listings_and_send_requests")}
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                              onClick={() => navigate('/listings')}
                            >
                              {t("find_services")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'bookings' && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t("my_bookings")}</h2>
                        
                        {bookings && bookings.length > 0 ? (
                          <div className="space-y-6">
                            {bookings.map((booking, index) => (
                              <div 
                                key={booking.id} 
                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="p-5">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {booking.listing?.title || 'Service Booking'}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                                        Provider: {booking.provider?.profile?.full_name || t("unknown_provider")}
                                      </p>
                                    </div>
                                    <div>
                                      <span className={`badge ${getBookingStatusBadgeVariant(booking.status)}`}>
                                        {booking.status.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    <div className="bg-gray-100 dark:bg-gray-600 px-3 py-0 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(booking.scheduled_time).toLocaleDateString()}
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center text-gray-700 dark:text-gray-300">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(booking.scheduled_time).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-750 px-5 py-3 border-t border-gray-200 dark:border-gray-600">
                                  <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {t("booked_on")} {new Date(booking.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                      {booking.status === 'completed' && (
                                        <>
                                          {hasReviewedBooking(booking) ? (
                                            <Button size="sm" variant="outline" disabled className="text-gray-500">
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              {t("review_submitted")}
                                            </Button>
                                          ) : (
                                            <Button size="sm">
                                              {t("leave_review")}
                                            </Button>
                                          )}
                                        </>
                                      )}
                                      <Button size="sm">
                                        {t("view_details")}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3 animate-bounce" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("no_bookings_yet")}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                              {t("when_you_book_services_theyll_appear_here")}
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
                              onClick={() => navigate('/listings')}
                            >
                              {t("find_services")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                      <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6 transition-all duration-300 hover:shadow-md">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t("my_reviews")}</h2>
                        
                        {reviews && reviews.length > 0 ? (
                          <div className="space-y-6">
                            {reviews.map((review, index) => (
                              <div 
                                key={review.id} 
                                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-5 transition-all duration-300 hover:shadow-md"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    {review.service_title && (
                                      <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-1">
                                        {review.listing_id ? (
                                          <Link 
                                            to={`/listings/${review.listing_id}`}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            {review.service_title}
                                          </Link>
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
      {deleteDialogOpen && listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t("delete_listing")}</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {t("are_you_sure_you_want_to_delete", { title: listingToDelete.title })}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDeleteListing}>
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDeleteListing}>
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted sidebar content component
function SidebarContent({ collapsed, isRTL }: { collapsed: boolean; isRTL?: boolean }) {
  // Use the translation hook from react-i18next
  // This assumes SidebarContent is always rendered inside ProfilePage, so we can use the parent's translation context.
  function t(key: string): React.ReactNode {
    const { t } = useTranslation();
    return t(key);
  }

  return (
    <div className={`px-4 space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white transition-all duration-300 hover:shadow-md`}
        >
          <Home size={20} />
          {!collapsed && <span>{t("dashboard")}</span>}
        </Link>
        
        <Link to="/analytics" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <BarChart2 size={20} />
          {!collapsed && <span>{t("analytics")}</span>}
        </Link>

        <Link to="/schedule" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <Calendar size={20} />
          {!collapsed && <span>{t("schedule")}</span>}
        </Link>
      </div>
      
      {!collapsed && <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2 px-3">
          {t("communication")}
        </h3>
      </div>}
      
      <div className="space-y-2">
        <Link to="/messages" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <MessageSquare size={20} />
          {!collapsed && <span>{t("messages")}</span>}
        </Link>
        
        <Link to="/documents" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <FileText size={20} />
          {!collapsed && <span>{t("documents")}</span>}
        </Link>
        
        <Link to="/connections" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <Users size={20} />
          {!collapsed && <span>{t("connections")}</span>}
        </Link>
        
        <Link to="/settings" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
          <Settings size={20} />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>
      </div>
      
      {!collapsed && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2 px-3">
              {t("ai_tools")}
            </h3>
          </div>
          
          <div className="space-y-2">
            <Link to="/ai-chat" className={`flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300`}>
              <MessageSquare size={20} />
              <span>{t("ai_chat")}</span>
            </Link>
            
            
          </div>
          
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-700/10 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 relative overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-blue-500/20 blur-xl"></div>
              <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2 relative z-10">{t("upgrade_to_pro")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 relative z-10">
                {t("unlock_premium_features")}
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg relative z-10">
                {t("upgrade_now")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions for status badges
function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'default';
    case 'quoted':
      return 'outline';
    case 'booked':
      return 'secondary';
    case 'closed':
      return 'destructive';
    default:
      return 'default';
  }
}

function getBookingStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'outline';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
}

// Format time ago helper function
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

// Check if user has already reviewed a booking
function hasReviewedBooking(booking: Booking): boolean {
  // Just check the has_review flag on the booking
  return booking.has_review === true;
}
