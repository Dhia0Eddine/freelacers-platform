import './index.css'

// src/main.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.tsx"; // Using this router configuration
import { AuthProvider } from "@/context/AuthContext"; // ⬅️ import
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n.ts"; // You need to create this file (see below)

// Add this component to handle the dir attribute
function DirectionSetter() {
  React.useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <DirectionSetter />
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AuthProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
