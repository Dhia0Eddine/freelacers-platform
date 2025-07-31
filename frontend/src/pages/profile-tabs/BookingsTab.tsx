import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface Booking {
  id: number;
  listing?: { title: string };
  provider?: { profile?: { full_name: string } };
  scheduled_time: string;
  status: string;
  created_at: string;
}

interface BookingsTabProps {
  bookings: Booking[];
  navigate: any;
  t: any;
  hasReviewedBooking: (booking: Booking) => boolean;
}

export default function BookingsTab({ bookings, t, hasReviewedBooking }: BookingsTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t("my_bookings")}</h2>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
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
                    <span className="badge">{booking.status.toUpperCase()}</span>
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
                      hasReviewedBooking(booking) ? (
                        <Button size="sm" variant="outline" disabled className="text-gray-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t("review_submitted")}
                        </Button>
                      ) : (
                        <Button size="sm">
                          {t("leave_review")}
                        </Button>
                      )
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
          <p className="text-gray-500 dark:text-gray-400">{t("no_bookings_yet")}</p>
        </div>
      )}
    </div>
  );
}
