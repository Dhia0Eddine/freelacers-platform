import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, BarChart2, Calendar, MessageSquare, FileText, Users, Settings
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button';
// SidebarContent component
function SidebarContent({ collapsed, isRTL }: { collapsed: boolean; isRTL?: boolean }) {
  function t(key: string): React.ReactNode {
    const { t } = useTranslation();
    return t(key);
  }

  return (
    <div className={`px-4 space-y-6 ${isRTL ? 'text-right' : ''}`}>
      <div className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center ${isRTL ? 'space-x-3' : ''} space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white transition-all duration-300 hover:shadow-md`}
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
function hasReviewedBooking(booking: { has_review?: boolean }): boolean {
  return booking.has_review === true;
}

export default SidebarContent;
export {
  getStatusBadgeVariant,
  getBookingStatusBadgeVariant,
  formatTimeAgo,
  hasReviewedBooking,
};
