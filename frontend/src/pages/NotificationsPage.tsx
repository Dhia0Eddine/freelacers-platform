import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Bell, Search, AlertCircle, Check, BookOpen, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  notification_type: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to related content if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError(t('something_went_wrong'));
    }
  };

  // Filter notifications based on active tab and search term
  const filteredNotifications = notifications.filter(notification => {
    // First filter by tab (read status)
    if (activeTab === 'unread' && notification.is_read) return false;
    if (activeTab === 'read' && !notification.is_read) return false;
    
    // Then filter by search term
    if (searchTerm && !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Format notification date to be human-readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If less than 24 hours ago, show relative time
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      const hours = Math.floor((now.getTime() - date.getTime()) / (60 * 60 * 1000));
      if (hours === 0) {
        const minutes = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));
        return minutes === 0 ? t('just_now') : t('minutes_ago', { count: minutes });
      }
      return t('hours_ago', { count: hours });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            {t('notifications')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('notifications_description')}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('search_notifications')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full md:w-64"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center px-4 py-2">
              <TabsList className="grid grid-cols-3 w-auto">
                <TabsTrigger value="all">{t('all')}</TabsTrigger>
                <TabsTrigger value="unread">{t('unread')}</TabsTrigger>
                <TabsTrigger value="read">{t('read')}</TabsTrigger>
              </TabsList>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                disabled={loading || notifications.every(n => n.is_read)}
              >
                {t('mark_all_as_read')}
              </Button>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="focus:outline-none">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('error')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchNotifications}
                    className="mt-2"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    {t('retry')}
                  </Button>
                </Alert>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {t('no_matching_notifications')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                      {t('try_different_search')}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {activeTab === 'all' ? t('no_notifications') : 
                       activeTab === 'unread' ? t('no_unread_notifications') : 
                       t('no_read_notifications')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                      {t('notifications_will_appear_here')}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                      ${notification.is_read ? 'opacity-80' : 'bg-blue-50 dark:bg-blue-900/20'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                        notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'
                      }`}></div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-gray-900 dark:text-gray-100">
                            {notification.message}
                          </p>
                          {notification.is_read && (
                            <BookOpen className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
