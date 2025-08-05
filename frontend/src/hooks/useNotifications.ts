import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/api';
import { useAuthContext } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

export interface Notification {
  id: number;
  type: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(pollingInterval = 60000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();
  // FIXED: Get socket directly at top level instead of inside useEffect
  const { unreadCount: socketUnreadCount, setUnreadCount, addNotification, socket } = useSocket();

  // Use local state for unread count that we can update directly
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  
  // IMPORTANT FIX: Add a function to add a notification to the list
  const addNotificationToList = useCallback((notification: Notification) => {
    console.log("Adding notification to list:", notification);
    // Check if notification already exists to prevent duplicates
    setNotifications(prev => {
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });
  }, []);
  
  // Sync socket context unread count with our local one
  useEffect(() => {
    if (localUnreadCount !== socketUnreadCount) {
      setUnreadCount(localUnreadCount);
    }
  }, [localUnreadCount, socketUnreadCount, setUnreadCount]);

  // Expose the update function to allow external components to update the count
  const updateUnreadCount = useCallback((updater: number | ((prev: number) => number)) => {
    if (typeof updater === 'function') {
      setLocalUnreadCount(prev => {
        const newCount = updater(prev);
        console.log(`Updating unread count: ${prev} -> ${newCount}`);
        setUnreadCount(newCount); // Also update socket context
        return newCount;
      });
    } else {
      console.log(`Setting unread count directly to: ${updater}`);
      setLocalUnreadCount(updater);
      setUnreadCount(updater); // Also update socket context
    }
  }, [setUnreadCount]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      
      // Update unread count
      const count = data.filter((notification: Notification) => !notification.is_read).length;
      updateUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, updateUnreadCount]);

  // Fetch unread count separately (more efficient)
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated, setUnreadCount]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Decrement unread count - FIXED: use localUnreadCount instead of unreadCount
      setLocalUnreadCount(prev => prev > 0 ? prev - 1 : 0);
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [setUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // FIXED: Properly connect to socket events in the hook
  // Now we use the socket from the top level instead of calling useSocket() inside useEffect
  useEffect(() => {
    if (!socket || !isAuthenticated) return;
    
    console.log("Setting up socket notification listener in useNotifications hook");
    
    const handleNewNotification = (data: any) => {
      console.log("useNotifications hook received socket message:", data);
      
      if (data.type === "notification" && data.data) {
        const notification = data.data as Notification;
        
        // Add to our notifications list
        addNotificationToList(notification);
        
        // Update the unread count if needed
        if (!notification.is_read) {
          updateUnreadCount(count => count + 1);
        }
      }
    };

    // Actually connect to the socket event
    socket.on("message", handleNewNotification);
    
    return () => {
      console.log("Cleaning up socket listener in useNotifications");
      socket.off("message", handleNewNotification);
    };
  }, [socket, isAuthenticated, updateUnreadCount, addNotificationToList]);

  return {
    notifications,
    unreadCount: localUnreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    updateUnreadCount,
    addNotificationToList
  };
}

export default useNotifications;
