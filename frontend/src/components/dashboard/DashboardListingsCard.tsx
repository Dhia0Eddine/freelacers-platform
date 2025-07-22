import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Listing {
  id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
  request_count?: number;
}

interface DashboardListingsCardProps {
  listings: Listing[];
  onAddListing: () => void;
}

export function DashboardListingsCard({ listings, onAddListing }: DashboardListingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              My Listings
            </CardTitle>
            <CardDescription>
              Services you're offering to clients
            </CardDescription>
          </div>
          <Button onClick={onAddListing}>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div 
                key={listing.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      <Link 
                        to={`/listings/${listing.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {listing.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{listing.description}</p>
                  </div>
                  <Badge variant={listing.available ? 'outline' : 'secondary'}>
                    {listing.available ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="text-sm flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {listing.location}
                  </div>
                  <div className="text-sm flex items-center text-gray-600 dark:text-gray-400">
                    <span className="font-medium">${listing.min_price} - ${listing.max_price}</span>
                  </div>
                  {listing.request_count !== undefined && (
                    <div className="text-sm flex items-center text-blue-600 dark:text-blue-400">
                      <span>{listing.request_count} requests</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No listings yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Start offering your services by creating your first listing.
            </p>
            <Button onClick={onAddListing}>
              Create Your First Listing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
