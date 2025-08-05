import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

// Define proper types for the context
export interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  addNotification: (notification: any) => void;
}

// Create context with proper typing
const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  unreadCount: 0,
  setUnreadCount: () => {},
  addNotification: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, token } = useAuthContext();
  // Track renders and changes for debugging
  const renderCount = useRef(0);

  // Debug renders
  useEffect(() => {
    renderCount.current += 1;
    console.log(`SocketProvider rendered ${renderCount.current} times. Unread count: ${unreadCount}`);
  });

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      console.log('Connecting to socket server:', SOCKET_URL);
      
      const socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // We will keep this basic listener for debugging
      socketInstance.on('message', (data) => {
        console.log('SocketContext received message:', data);
      });

      setSocket(socketInstance);

      return () => {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  // Function to add a new notification
  const addNotification = (notification: any) => {
    console.log('SocketContext adding notification:', notification);
    
    // If it's unread, increment the counter
    if (notification && !notification.is_read) {
      setUnreadCount(prev => {
        const newCount = prev + 1;
        console.log(`SocketContext updating unread count: ${prev} -> ${newCount}`);
        return newCount;
      });
    }
  };

  // IMPORTANT: Ensure unreadCount state persists across renders
  // Store unreadCount in sessionStorage for persistence
  useEffect(() => {
    // Load initial count from storage
    const storedCount = sessionStorage.getItem('unreadNotificationCount');
    if (storedCount) {
      const count = parseInt(storedCount, 10);
      if (!isNaN(count) && count > 0) {
        console.log(`Loading saved unread count from storage: ${count}`);
        setUnreadCount(count);
      }
    }
  }, []);

  // Save count changes to storage
  useEffect(() => {
    if (unreadCount > 0) {
      console.log(`Saving unread count to storage: ${unreadCount}`);
      sessionStorage.setItem('unreadNotificationCount', unreadCount.toString());
    }
  }, [unreadCount]);

  return (
    <SocketContext.Provider 
      value={{ 
        socket, 
        connected, 
        unreadCount, 
        setUnreadCount, 
        addNotification 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
        