import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth related API calls
export const authService = {
  register: async (email: string, password: string, role: string) => {
    try {
      const response = await api.post('/register', { email, password, role });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || 'Registration failed');
      }
      throw new Error('Registration failed due to network issue');
    }
  },

  login: async (email: string, password: string) => {
    try {
      // Create form data for FastAPI's OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      console.log('Attempting login to:', `${API_URL}/login`);
      
      const response = await axios.post(`${API_URL}/login`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Login response:', response.data);
      
      // Log token information for debugging
      if (response.data.access_token) {
        console.log('Token received, length:', response.data.access_token.length);
        try {
          const decoded = jwtDecode(response.data.access_token);
          console.log('Decoded token in API service:', decoded);
        } catch (decodeError) {
          console.error('Failed to decode token in API service:', decodeError);
        }
      } else {
        console.error('No token in response!');
      }
      
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Status code:', error.response?.status);
        throw new Error(error.response?.data?.detail || 'Login failed');
      }
      throw new Error('Login failed due to network issue');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Profile related API calls
export const profileService = {
  createProfile: async (profileData: {
    fullName: string;
    bio?: string;
    location: string;
    phone: string; // Changed from phoneNumber to phone
  }) => {
    try {
      // Convert from camelCase to snake_case to match backend expectations
      const formattedData = {
        full_name: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        phone: profileData.phone // Changed from phone_number to phone
      };
      
      const response = await api.post('/profiles/', formattedData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Profile creation error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create profile');
      }
      throw new Error('Failed to create profile due to network issue');
    }
  },

  getMyProfile: async () => {
    try {
      console.log('Fetching profile from:', `${API_URL}/profiles/me`);
      
      const response = await api.get('/profiles/me');
      
      // Log the raw response for debugging
      console.log('Raw profile response status:', response.status);
      console.log('Raw profile response headers:', response.headers);
      console.log('Raw profile response data:', JSON.stringify(response.data, null, 2));
      
      // Normalize the field names to handle potential backend inconsistencies
      const profileData = response.data;
      
      // Ensure the phone field exists (handle different field names)
      if (!profileData.phone && profileData.phone_number) {
        profileData.phone = profileData.phone_number;
      }
      
      return profileData;
    } catch (error) {
      console.error('Profile fetch error details:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get profile');
      }
      throw new Error('Failed to get profile due to network issue');
    }
  },

  // Add a new method to get current user data including role and email
  getCurrentUser: async () => {
    try {
      console.log('Fetching current user data from:', `${API_URL}/users/me`);
      
      const response = await api.get('/users/me');
      
      // Log the raw response for debugging
      console.log('Raw user response data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('User data fetch error details:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get user data');
      }
      throw new Error('Failed to get user data due to network issue');
    }
  },

  getProfileById: async (userId: string) => {
    try {
      console.log(`Fetching profile for user ${userId} from: ${API_URL}/profiles/${userId}`);
      
      const response = await api.get(`/profiles/${userId}`);
      console.log('Profile response:', response.data);
      
      // If profile data doesn't include user role but has user_id
      if (response.data && response.data.user_id && (!response.data.user || !response.data.user.role)) {
        try {
          // You could create an API endpoint to get user data by ID
          // For now we'll infer provider status from listings
          const listingsResponse = await api.get(`/listings/user/${response.data.user_id}`);
          const hasListings = Array.isArray(listingsResponse.data) && listingsResponse.data.length > 0;
          
          // Create a user object with the inferred role
          response.data.user = {
            id: response.data.user_id,
            role: hasListings ? "provider" : "customer",
            email: "" // Email might not be available for privacy reasons
          };
          
          console.log("Added inferred user data to profile:", response.data.user);
        } catch (userError) {
          console.error("Error inferring user role:", userError);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Profile fetch error details:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get profile');
      }
      throw new Error('Failed to get profile due to network issue');
    }
  },

  updateProfile: async (profileData: {
    full_name: string;
    bio?: string;
    location: string;
    phone: string;
    profile_picture?: string; // <-- Add this line
  }) => {
    try {
      console.log('Updating profile:', profileData);
      const response = await api.put('/profiles/', profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error details:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update profile');
      }
      throw new Error('Failed to update profile due to network issue');
    }
  },
};

// Listing related API calls
export const listingService = {
  getMyListings: async () => {
    try {
      console.log('Fetching my listings from:', `${API_URL}/listings/me`);
      const response = await api.get('/listings/me');
      console.log('My listings response data:', response.data);
      
      // Ensure we return an array even if the API returns null or undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listings fetch error details:', error.response.data);
        console.error('Listings fetch status:', error.response.status);
        throw new Error(error.response.data.detail || 'Failed to get listings');
      }
      throw new Error('Failed to get listings due to network issue');
    }
  },

  createListing: async (listingData: {
    title: string;
    description: string;
    min_price: number;
    max_price: number;
    location: string;
    available: boolean;
    service_id: number;
  }) => {
    try {
      const response = await api.post('/listings', listingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listing creation error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create listing');
      }
      throw new Error('Failed to create listing due to network issue');
    }
  },

  getListingsByUserId: async (userId: string) => {
    try {
      console.log(`Fetching listings for user ${userId} from: ${API_URL}/listings/user/${userId}`);
      const response = await api.get(`/listings/user/${userId}`);
      console.log('User listings response data:', response.data);
      
      // Ensure we return an array even if the API returns null or undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listings fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get listings');
      }
      throw new Error('Failed to get listings due to network issue');
    }
  },

  getListings: async (params: {
    page?: number;
    limit?: number;
    keyword?: string;
    serviceId?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    minRating?: number;
  }) => {
    try {
      // Convert params to query string
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.keyword) queryParams.append('keyword', params.keyword);
      
      // Log the serviceId being passed to ensure it's correctly formatted
      if (params.serviceId) {
        console.log(`Adding service_id=${params.serviceId} to query params`);
        queryParams.append('service_id', params.serviceId.toString());
      }
      
      if (params.minPrice) queryParams.append('min_price', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('max_price', params.maxPrice.toString());
      if (params.location) queryParams.append('location', params.location);
      if (params.minRating) queryParams.append('min_rating', params.minRating.toString());
      
      const queryString = queryParams.toString();
      const url = `/listings${queryString ? `?${queryString}` : ''}`;
      
      // Enhanced logging to see the complete URL
      console.log('Fetching listings with URL:', `${API_URL}${url}`);
      const response = await api.get(url);
      console.log('Listings API response status:', response.status);
      return response.data;
    } catch (error) {
      // Add more detailed error logging
      console.error('Error fetching listings:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get listings');
      }
      throw new Error('Failed to get listings due to network issue');
    }
  },

  getListingById: async (listingId: string) => {
    try {
      console.log(`Fetching listing ${listingId} from: ${API_URL}/listings/${listingId}`);
      const response = await api.get(`/listings/${listingId}`);
      console.log('Listing response data:', response.data);
      
      // If the listing has a user_id but no profile data, fetch the profile
      if (response.data && response.data.user_id && !response.data.profile) {
        try {
          console.log(`Fetching profile for user ${response.data.user_id}`);
          const profileResponse = await api.get(`/profiles/${response.data.user_id}`);
          console.log('Profile response:', profileResponse.data);
          
          // Attach the profile data to the listing
          response.data.profile = profileResponse.data;
        } catch (profileError) {
          console.error('Error fetching profile for listing:', profileError);
        }
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listing fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get listing');
      }
      throw new Error('Failed to get listing due to network issue');
    }
  },

  // Add deleteListing method
  deleteListing: async (listingId: number) => {
    try {
      const response = await api.delete(`/listings/${listingId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listing delete error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to delete listing');
      }
      throw new Error('Failed to delete listing due to network issue');
    }
  },

  // Add updateListing method
  updateListing: async (
    listingId: string | number,
    listingData: {
      title: string;
      description: string;
      min_price: number;
      max_price: number;
      location: string;
      available: boolean;
      service_id: number;
    }
  ) => {
    try {
      const response = await api.put(`/listings/${listingId}`, listingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Listing update error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update listing');
      }
      throw new Error('Failed to update listing due to network issue');
    }
  }
};

// Service related API calls
export const serviceService = {
  getAllServices: async () => {
    try {
      console.log('Fetching services from:', `${API_URL}/services/`);
      const response = await api.get('/services/');
      console.log('Services response data:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Services fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get services');
      }
      throw new Error('Failed to get services due to network issue');
    }
  },

  getServiceById: async (serviceId: string) => {
    try {
      console.log(`Fetching service ${serviceId} from: ${API_URL}/services/${serviceId}`);
      const response = await api.get(`/services/${serviceId}`);
      console.log('Service response data:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Service fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get service');
      }
      throw new Error('Failed to get service due to network issue');
    }
  },
  
  createService: async (serviceData: {
    category_id: number;
    name: string;
    description?: string;
  }) => {
    try {
      const response = await api.post('/services/', serviceData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Service creation error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create service');
      }
      throw new Error('Failed to create service due to network issue');
    }
  },
  
  updateService: async (serviceId: string, serviceData: {
    category_id?: number;
    name?: string;
    description?: string;
  }) => {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Service update error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update service');
      }
      throw new Error('Failed to update service due to network issue');
    }
  },
  
  deleteService: async (serviceId: string) => {
    try {
      await api.delete(`/services/${serviceId}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Service deletion error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to delete service');
      }
      throw new Error('Failed to delete service due to network issue');
    }
  }
};

// Request related API calls
export const requestService = {
  createRequest: async (requestData: {
    listing_id: number;
    description?: string;
    location?: string;
    preferred_date: string;
  }) => {
    try {
      console.log('Creating request with data:', requestData);
      const response = await api.post('/requests/', requestData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Request creation error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create request');
      }
      throw new Error('Failed to create request due to network issue');
    }
  },

  getMyRequests: async () => {
    try {
      const response = await api.get('/requests/me');
      console.log('My requests response data:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching requests:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get requests');
      }
      throw new Error('Failed to get requests due to network issue');
    }
  },

  // Add method to get a specific request by ID
  getRequestById: async (requestId: number) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      console.log('Request details response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching request details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get request details');
      }
      throw new Error('Failed to get request details due to network issue');
    }
  },

  // Add method to get quotes for a specific request
  getQuotesForRequest: async (requestId: number) => {
    try {
      const response = await api.get(`/quotes/request/${requestId}`);
      console.log('Quotes for request response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching quotes for request:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get quotes');
      }
      throw new Error('Failed to get quotes due to network issue');
    }
  },

  // Add method to update quote status (accept/reject)
  updateQuoteStatus: async (quoteId: number, status: string) => {
    try {
      const response = await api.patch(`/quotes/${quoteId}/status`, { status });
      console.log('Quote status update response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error updating quote status:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update quote status');
      }
      throw new Error('Failed to update quote status due to network issue');
    }
  },
  
  // Add method to create a booking from an accepted quote
  createBooking: async (bookingData: {
    quote_id: number;
    scheduled_time: string;
  }) => {
    try {
      const response = await api.post('/bookings/', bookingData);
      console.log('Booking creation response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error creating booking:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create booking');
      }
      throw new Error('Failed to create booking due to network issue');
    }
  },

  // Add method to submit a quote for a request
  submitQuote: async (quoteData: {
    request_id: number;
    listing_id: number;
    price: number;
    message?: string;
  }) => {
    try {
      console.log('Submitting quote with data:', quoteData);
      const response = await api.post('/quotes/', quoteData);
      console.log('Quote submission response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error submitting quote:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to submit quote');
      }
      throw new Error('Failed to submit quote due to network issue');
    }
  },

  getQuoteById: async (quoteId: number) => {
    try {
      const response = await api.get(`/quotes/${quoteId}`);
      console.log('Quote details response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching quote details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get quote details');
      }
      throw new Error('Failed to get quote details due to network issue');
    }
  },
};

// Booking related API calls
export const bookingService = {
  getMyBookings: async () => {
    try {
      const response = await api.get('/bookings');
      console.log('My bookings response data:', response.data);
      
      // Process the data to ensure has_review is a proper boolean
      const processedBookings = Array.isArray(response.data) 
        ? response.data.map(booking => ({
            ...booking,
            // Explicitly convert has_review to boolean if it exists, default to false if not
            has_review: booking.has_review === true || booking.has_review === 'true' || false
          }))
        : [];
      
      console.log('Processed bookings with has_review:', processedBookings);
      return processedBookings;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching bookings:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get bookings');
      }
      throw new Error('Failed to get bookings due to network issue');
    }
  },

  updateBookingStatus: async (bookingId: number, status: string) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}`, { status });
      console.log('Booking status update response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error updating booking status:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update booking status');
      }
      throw new Error('Failed to update booking status due to network issue');
    }
  },

  getBookingById: async (bookingId: number) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      console.log('Booking details response:', response.data);
      
      // Ensure has_review is a proper boolean
      const processedBooking = {
        ...response.data,
        has_review: response.data.has_review === true || response.data.has_review === 'true' || false
      };
      
      console.log('Processed booking with has_review:', processedBooking);
      return processedBooking;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching booking details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get booking details');
      }
      throw new Error('Failed to get booking details due to network issue');
    }
  },
};

// Review related API calls
export const reviewService = {
  // Update method for clarity - gets reviews ABOUT the current user (for providers)
  getReviewsAboutMe: async () => {
    try {
      const response = await api.get('/reviews/me/received');
      console.log('Reviews about me response data:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching reviews about me:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get reviews');
      }
      throw new Error('Failed to get reviews due to network issue');
    }
  },
  
  // New method for reviews WRITTEN by the current user (for customers)
  getReviewsWrittenByMe: async () => {
    try {
      const response = await api.get('/reviews/me/written');
      console.log('Reviews written by me response data:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching reviews written by me:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get reviews');
      }
      throw new Error('Failed to get reviews due to network issue');
    }
  },
  
  // Keep original method for backward compatibility, but make it role-aware
  getMyReviews: async (role?: string) => {
    try {
      // If role is specified, use the appropriate endpoint
      if (role === 'provider') {
        return await reviewService.getReviewsAboutMe();
      } else if (role === 'customer') {
        return await reviewService.getReviewsWrittenByMe();
      }
      
      // Otherwise use the generic endpoint which will be role-aware on the server
      const response = await api.get('/reviews/me');
      console.log('My reviews response data:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching reviews:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get reviews');
      }
      throw new Error('Failed to get reviews due to network issue');
    }
  },
  
  createReview: async (reviewData: {
    booking_id: number;
    rating: number;
    comment?: string;
  }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Review creation error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to create review');
      }
      throw new Error('Failed to create review due to network issue');
    }
  },
  
  getBookingReview: async (bookingId: number) => {
    try {
      const response = await api.get(`/reviews/booking/${bookingId}`);
      console.log('Booking review response:', response.data);
      
      // Ensure we're returning an object and not void
      if (response.data && typeof response.data === 'object') {
        return response.data;
      } else {
        console.error('Invalid review data format received:', response.data);
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching booking review:', error.response.data);
        if (error.response.status === 404) {
          // Not found is an expected case - return null rather than throwing
          return null;
        }
        throw new Error(error.response.data.detail || 'Failed to get review');
      }
      throw new Error('Failed to get review due to network issue');
    }
  },
  
  // New method to get reviews about a specific user (for viewing provider profiles)
  getReviewsAboutUser: async (userId: number) => {
    try {
      const response = await api.get(`/reviews/about/${userId}`);
      console.log('Reviews about user response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching reviews about user:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get reviews about user');
      }
      throw new Error('Failed to get reviews about user due to network issue');
    }
  },

  // Add a new method to get reviews by a customer
  getCustomerReviews: async (userId: number) => {
    try {
      const response = await api.get(`/reviews/customer/${userId}`);
      console.log('Customer reviews response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching customer reviews:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get customer reviews');
      }
      throw new Error('Failed to get customer reviews due to network issue');
    }
  },

  // Add updateReview method to reviewService for editing a review
  updateReview: async (reviewId: number, reviewData: { rating: number; comment?: string }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Review update error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to update review');
      }
      throw new Error('Failed to update review due to network issue');
    }
  },
};

// Dashboard related API calls
export const dashboardService = {
  getProviderDashboard: async () => {
    try {
      const response = await api.get('/dashboard/provider');
      console.log('Provider dashboard data:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Dashboard fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get dashboard data');
      }
      throw new Error('Failed to get dashboard data due to network issue');
    }
  },
  
  getCustomerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/customer');
      console.log('Customer dashboard data:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Dashboard fetch error details:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get dashboard data');
      }
      throw new Error('Failed to get dashboard data due to network issue');
    }
  }
};

export default api;
