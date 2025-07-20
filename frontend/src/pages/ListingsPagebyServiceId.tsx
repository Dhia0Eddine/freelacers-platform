import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// Import API_URL from the config file
import { API_URL } from '@/config';

import { 
  MapPinIcon, 
  StarIcon, 
  UserIcon,
  ChevronLeftIcon,
  SearchIcon,
  FilterIcon,
  XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Define the interfaces for our data structures
interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  location: string | null;
  average_rating: number | null;
}

interface Listing {
  id: number;
  service_id: number;
  title: string;
  description: string | null;
  min_price: number;
  max_price: number;
  location: string | null;
  available: boolean;
  user_id: number;
  created_at: string;
  profile: Profile | null;
}

const ListingsPagebyServiceId: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string>('');
  
  // Filter states
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [minRatingFilter, setMinRatingFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        // First get the service name
        const serviceResponse = await axios.get(`${API_URL}/services/${serviceId}`);
        if (serviceResponse.data) {
          setServiceName(serviceResponse.data.name);
        }

        // Then get the listings for this service
        const response = await axios.get(`${API_URL}/listings/service/${serviceId}`);
        console.log('API Response:', response.data); // Debug the response
        
        // Ensure listings is always an array
        if (Array.isArray(response.data)) {
          setListings(response.data);
        } else {
          // If the response is not an array, check if it has a data property that is an array
          if (response.data && Array.isArray(response.data.data)) {
            setListings(response.data.data);
          } else {
            // If we can't find an array, set an empty array and log an error
            console.error('API response is not in expected format:', response.data);
            setListings([]);
            setError('Received unexpected data format from server');
          }
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setListings([]); // Ensure listings is an empty array when there's an error
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchListings();
    }
  }, [serviceId]);

  // Apply filters when listings or filter criteria change
  useEffect(() => {
    if (!listings || listings.length === 0) {
      setFilteredListings([]);
      return;
    }

    let results = [...listings];

    // Filter by price range
    if (minPriceFilter !== null) {
      results = results.filter(listing => listing.min_price >= minPriceFilter);
    }
    if (maxPriceFilter !== null) {
      results = results.filter(listing => listing.max_price <= maxPriceFilter);
    }

    // Filter by location
    if (locationFilter) {
      results = results.filter(listing => 
        listing.location && listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by availability
    if (availabilityFilter !== null) {
      results = results.filter(listing => listing.available === availabilityFilter);
    }

    // Filter by minimum rating
    if (minRatingFilter !== null) {
      results = results.filter(listing => 
        listing.profile && 
        listing.profile.average_rating && 
        listing.profile.average_rating >= minRatingFilter
      );
    }

    // Filter by search term (in title or description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(listing => 
        (listing.title && listing.title.toLowerCase().includes(term)) ||
        (listing.description && listing.description.toLowerCase().includes(term))
      );
    }

    setFilteredListings(results);
  }, [listings, minPriceFilter, maxPriceFilter, locationFilter, availabilityFilter, minRatingFilter, searchTerm]);

  // Reset all filters
  const resetFilters = () => {
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setLocationFilter('');
    setAvailabilityFilter(null);
    setMinRatingFilter(null);
    setSearchTerm('');
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link to="/services" className="flex items-center text-blue-600 hover:underline mb-4">
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Services
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {loading ? <Skeleton className="h-10 w-64" /> : serviceName ? `${serviceName} Listings` : 'Service Listings'}
        </h1>
        <p className="text-gray-600">
          {loading ? <Skeleton className="h-6 w-96" /> : 
            listings.length > 0 
            ? `Found ${filteredListings.length} of ${listings.length} listings in this category` 
            : 'No listings found for this service'}
        </p>
      </div>

      {/* Search and filter toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:w-auto w-full"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filter Listings</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">
              <XIcon className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPriceFilter === null ? '' : minPriceFilter}
                  onChange={(e) => setMinPriceFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full"
                />
                <span>to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPriceFilter === null ? '' : maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select
                value={availabilityFilter === null ? '' : availabilityFilter ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  setAvailabilityFilter(value === '' ? null : value === 'true');
                }}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            
            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Rating</label>
              <select
                value={minRatingFilter === null ? '' : minRatingFilter}
                onChange={(e) => setMinRatingFilter(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Star</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : filteredListings.length > 0 ? (
        // Listings grid - now showing filtered listings
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">{listing.title}</CardTitle>
                {listing.profile && (
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{listing.profile.full_name}</span>
                    {listing.profile.average_rating && (
                      <div className="flex items-center ml-2">
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{listing.profile.average_rating}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {listing.description || 'No description provided.'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {formatPrice(listing.min_price)} - {formatPrice(listing.max_price)}
                  </Badge>
                  {listing.location && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {listing.location}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/listings/${listing.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : listings.length > 0 ? (
        // No results after filtering
        <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">No listings match your filter criteria.</p>
          <Button onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        // Empty state (no listings at all)
        <div className="bg-gray-50 p-10 rounded-lg text-center">
          <p className="text-gray-600 mb-6">There are currently no listings for this service category.</p>
          <h3 className="text-xl font-medium mb-2">No listings available</h3>
          <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <Link to="/services">
            <Button>Browse Other Services</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ListingsPagebyServiceId;
