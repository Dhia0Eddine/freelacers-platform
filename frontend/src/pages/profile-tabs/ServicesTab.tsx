import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MapPin } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  description: string;
  min_price: number;
  max_price: number;
  location: string;
  available: boolean;
}

interface ServicesTabProps {
  listings: Listing[];
  onEditListing: (id: number) => void;
  onDeleteListing: (listing: Listing) => void;
  navigate: any;
  t: any;
}

export default function ServicesTab({ listings, onEditListing, onDeleteListing, navigate, t }: ServicesTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("my_services")}</h2>
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate('/listings/new')}
        >
          + {t("add_new_listing")}
        </Button>
      </div>
      {listings && listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
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
                <Button variant="outline" size="sm" onClick={() => onEditListing(listing.id)}>
                  {t("edit")}
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400" onClick={() => onDeleteListing(listing)}>
                  {t("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg transition-all duration-300">
          <p className="text-gray-500 dark:text-gray-400">{t("no_services_listed_yet")}</p>
        </div>
      )}
    </div>
  );
}
