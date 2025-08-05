// src/App.tsx
import React from 'react';
import { RouterProvider } from "react-router-dom";
// Import the router object correctly
import { router } from "./routes/index";
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import NotificationsPage from '@/pages/NotificationsPage';

export default function App() {
    return (
        <SocketProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
        </SocketProvider>
    );
}

// Note: Add the NotificationsPage route in your routes file instead of here
// For example in routes/index.tsx:
// { path: "/notifications", element: <NotificationsPage /> },
