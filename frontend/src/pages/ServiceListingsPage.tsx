import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listingService, serviceService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Star, User, Search, Filter, X, ChevronLeft, ChevronRight
} from 'lucide-react';

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
  profile?: {
    id: number;
    full_name: string;
    average_rating?: number;
  };
}

interface ListingsResponse {
  items: Listing[];
  total: number;
  page: number;
  total_pages: number;
  limit: number;
}

export default function ServiceListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State for listings and filters
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 1000);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : 0);
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') ? parseInt(searchParams.get('serviceId')!) : undefined);
  
  // Pagination
  const [page, setPage] = useState(searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1);
  const [limit, setLimit] = useState(10);
  
  // Effect to fetch listings when filters change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add more detailed logging to debug the issue
        console.log("Current search params:", Object.fromEntries([...searchParams]));
        
        // Check for serviceId in URL parameters
        const urlServiceId = searchParams.get('serviceId');
        console.log(`URL serviceId parameter: ${urlServiceId}`);
        
        if (urlServiceId && !serviceId) {
          const parsedServiceId = parseInt(urlServiceId);
          console.log(`Setting serviceId state to ${parsedServiceId}`);
          setServiceId(parsedServiceId);
        }

        // Ensure we're explicitly setting the serviceId parameter
        const params = {
          page,
          limit,
          keyword: keyword || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          location: location || undefined,
          minRating: minRating || undefined,
          serviceId: serviceId || (urlServiceId ? parseInt(urlServiceId) : undefined),
        };

        console.log("Fetching listings with params:", params);
        
        // Fetch service information if there's a serviceId
        let serviceInfo = null;
        if (params.serviceId) {
          try {
            serviceInfo = await serviceService.getServiceById(params.serviceId.toString());
            console.log("Service info:", serviceInfo);
          } catch (serviceErr) {
            console.error("Error fetching service info:", serviceErr);
          }
        }
        
        const data = await listingService.getListings(params);
        console.log("Received listings data:", JSON.stringify(data, null, 2)); // Enhanced logging
        
        // Validate the response data has the expected structure
        if (Array.isArray(data)) {
          // Check if user_id exists in the response
          const hasUserIds = data.every(item => typeof item.user_id === 'number');
          if (!hasUserIds) {
            console.warn("Some listings are missing user_id:", data);
          }
          
          setListings(data);
          setTotalPages(Math.ceil(data.length / limit));
        } else if (data.items && typeof data.total_pages === 'number') {
          // Check if user_id exists in the response
            const hasUserIds: boolean = data.items.every((item: Listing) => typeof item.user_id === 'number');
          if (!hasUserIds) {
            console.warn("Some listings are missing user_id:", data.items);
          }
          
          setListings(data.items);
          setTotalPages(data.total_pages);
        } else {
          // Fallback
          setListings(data);
          setTotalPages(1);
        }
        
        // Update URL params
        const newSearchParams = new URLSearchParams();
        if (page > 1) newSearchParams.set('page', page.toString());
        if (keyword) newSearchParams.set('keyword', keyword);
        if (minPrice > 0) newSearchParams.set('minPrice', minPrice.toString());
        if (maxPrice < 1000) newSearchParams.set('maxPrice', maxPrice.toString());
        if (location) newSearchParams.set('location', location);
        if (minRating > 0) newSearchParams.set('minRating', minRating.toString());
        if (serviceId) newSearchParams.set('serviceId', serviceId.toString());
        
        setSearchParams(newSearchParams);
        
        // Update document title with serviceId for debugging
        document.title = serviceId 
          ? `Service #${serviceId} Listings | Freelance Hub` 
          : "All Listings | Freelance Hub";
        
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [page, limit, serviceId, minRating, location, maxPrice, minPrice, keyword, setSearchParams, searchParams]);
  
  // Apply filters handler
  const applyFilters = () => {
    setPage(1); // Reset to first page when filters change
  };
  
  // Reset filters handler
  const resetFilters = () => {
    setKeyword('');
    setMinPrice(0);
    setMaxPrice(1000);
    setLocation('');
    setMinRating(0);
    setServiceId(undefined);
    setPage(1);
  };
  
  // Navigation handlers
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const goToListingDetail = (listingId: number) => {
    navigate(`/listings/${listingId}`);
  };
  
  // Fixed: Added null check for user_id
  const goToProviderProfile = (listing: Listing, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the listing click
    event.preventDefault();
    
    if (!listing || typeof listing.user_id !== 'number') {
      console.error("Cannot navigate: Invalid listing data or missing user_id:", listing);
      // Show an error toast or message to the user
      setError("Could not view provider profile: Missing user ID");
      return;
    }
    
    console.log("Navigating to provider profile:", listing.user_id, "Full listing data:", listing);
    navigate(`/profile/${listing.user_id}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header with search bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {serviceId ? "Service Listings" : "Browse All Listings"}
            </h1>
            {serviceId && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filtered by service:</span>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  Service #{serviceId}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-gray-600 dark:text-gray-300 hover:text-red-500"
                  onClick={() => {
                    setServiceId(undefined);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('serviceId');
                    setSearchParams(newParams);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filter
                </Button>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search services..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Button 
              variant="outline" 
              className="md:hidden" 
              onClick={toggleFilters}
            >
              <Filter className="h-5 w-5 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="lg:hidden p-1" 
                  onClick={toggleFilters}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter location..."
                  />
                </div>
                
                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="0">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={applyFilters}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="w-full"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Listings Grid */}
          <div className="w-full lg:w-3/4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6">
                Error: {error}
              </div>
            )}
            
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {!loading && listings.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or search for different keywords.
                </p>
                <Button
                  onClick={resetFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Listing Cards */}
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => goToListingDetail(listing.id)}
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                          ${listing.min_price} - ${listing.max_price}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
                        <div className="flex items-center gap-4">
                          {/* Provider Info - Fixed to pass the entire listing object */}
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={(e) => goToProviderProfile(listing, e)}
                          >
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full size-10 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {listing.profile?.full_name || 'Unknown Provider'}
                                {listing.profile?.average_rating ? 
                                  <span className="text-xs  text-yellow-500 ml-1">{listing.profile?.average_rating} <Star className="h-4 w-4 fill-current inline" /> </span> : 
                                  <span className="text-xs text-red-500 ml-1">(No ID)</span>
                                }
                              </div>
                              {listing.average_rating && (
                                <div className="flex items-center text-yellow-500">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="ml-1 text-sm">{listing.average_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {listings.length > 0 && (
                  <div className="flex justify-between items-center mt-8">
                    <div className="text-gray-600 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={goToPrevPage}
                        disabled={page <= 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        onClick={goToNextPage}
                        disabled={page >= totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
