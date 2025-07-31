
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

interface Request {
  id: number;
  listing?: { title: string; profile?: { full_name: string } };
  description?: string;
  location?: string;
  preferred_date: string;
  status: string;
  created_at: string;
}

interface RequestsTabProps {
  requests: Request[];
  navigate: any;
  t: any;
}

export default function RequestsTab({ requests, navigate, t }: RequestsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("my_service_requests")}</h2>
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-300 hover:shadow-lg"
          onClick={() => navigate('/listings')}
        >
          + {t("find_services")}
        </Button>
      </div>
      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
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
                  <span className="badge">{request.status.toUpperCase()}</span>
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
                  {new Date(request.created_at).toLocaleDateString()}
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
          <p className="text-gray-500 dark:text-gray-400">{t("no_service_requests_yet")}</p>
        </div>
      )}
    </div>
  );
}
