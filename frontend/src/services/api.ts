import axios from 'axios';

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
    phone: string; // Changed from phone_number to phone
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
  }) => {
    try {
      const response = await api.post('/listings/', listingData);
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
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error fetching requests:', error.response.data);
        throw new Error(error.response.data.detail || 'Failed to get requests');
      }
      throw new Error('Failed to get requests due to network issue');
    }
  }
};

export default api;
