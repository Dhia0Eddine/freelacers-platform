// src/App.tsx
import React from 'react';
import { Route, RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from 'react-hot-toast';
import NotificationsPage from '@/pages/NotificationsPage';

export default function App() {
    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
        </>
    );
}

// Add this route within your Routes component
<Route path="/notifications" element={<NotificationsPage />} />
