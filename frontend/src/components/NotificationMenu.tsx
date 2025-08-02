import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import { notificationService } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  notification_type: string;
}

export default function NotificationMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Get recent notifications (limit to 5)
      const recentNotifications = await notificationService.getNotifications();
      setNotifications(recentNotifications.slice(0, 5));
      
      // Get unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when the dropdown is opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Initial fetch for unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchUnreadCount();

    // Set up interval to refresh unread count every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle marking a notification as read
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to the related page if a link is provided
    if (notification.link) {
      navigate(notification.link);
    }
    
    setOpen(false);
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">{t('notifications')}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-xs"
            >
              {t('mark_all_as_read')}
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                    ${notification.is_read ? 'opacity-70' : 'bg-blue-50 dark:bg-blue-900/20'}
                  `}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-2 h-2 mt-2 rounded-full ${notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_notifications')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('notifications_will_appear_here')}</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuFooter className="text-center py-2">
          <Button variant="ghost" size="sm" onClick={() => {
            setOpen(false);
            navigate('/notifications');
          }}>
            {t('view_all_notifications')}
          </Button>
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
