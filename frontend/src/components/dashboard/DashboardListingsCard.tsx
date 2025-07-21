import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  DollarSign, 
  Edit, 
  Filter, 
  MapPin, 
  Plus, 
  Search, 
  ShoppingBag, 
  Trash2, 
  XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Listing {
  id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
  service_name?: string;
  created_at: string;
  request_count?: number;
}

interface DashboardListingsCardProps {
  listings: Listing[];
  onAddListing: () => void;
}

export function DashboardListingsCard({ listings, onAddListing }: DashboardListingsCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.min_price - b.min_price;
      case 'price_high':
        return b.min_price - a.min_price;
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const filteredListings = sortedListings.filter(listing => {
    // Availability filter
    if (availabilityFilter === 'available' && !listing.available) return false;
    if (availabilityFilter === 'unavailable' && listing.available) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.location.toLowerCase().includes(searchLower) ||
        (listing.service_name && listing.service_name.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const updateListingAvailability = (listingId: number, available: boolean) => {
    console.log(`Updating listing ${listingId} availability to ${available}`);
    // This would be implemented to call the API to update the listing
  };

  const formatPrice = (min: number, max: number) => {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              My Service Listings
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your service offerings
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_low">Lowest Price</SelectItem>
                <SelectItem value="price_high">Highest Price</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onAddListing} className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id}
                className="border rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">
                        <Link 
                          to={`/listings/${listing.id}`} 
                          className="hover:text-blue-600 transition-colors"
                        >
                          {listing.title}
                        </Link>
                      </h3>
                      <div className="flex items-center">
                        <Label htmlFor={`available-${listing.id}`} className="mr-2 text-sm">
                          {listing.available ? 'Active' : 'Inactive'}
                        </Label>
                        <Switch 
                          id={`available-${listing.id}`} 
                          checked={listing.available}
                          onCheckedChange={(checked) => updateListingAvailability(listing.id, checked)}
                        />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center">
                      {listing.service_name && (
                        <Badge variant="outline" className="mr-2">
                          {listing.service_name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Created {formatDate(listing.created_at)}
                      </span>
                      {listing.request_count !== undefined && listing.request_count > 0 && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {listing.request_count} {listing.request_count === 1 ? 'Request' : 'Requests'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4 line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    <span>{formatPrice(listing.min_price, listing.max_price)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{listing.location}</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Link to={`/listings/${listing.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
              {searchTerm || availabilityFilter !== 'all' 
                ? "No listings match your search criteria. Try adjusting your filters."
                : "You haven't created any service listings yet. Add your first listing to start receiving requests."}
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
              onClick={onAddListing}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Listing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
