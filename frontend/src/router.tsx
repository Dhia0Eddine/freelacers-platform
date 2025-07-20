import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import ServiceListingsPage from "@/pages/ServiceListingsPage";
import ServiceListingDetailPage from "@/pages/ServiceListingDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import UserProfilePage from "@/pages/UserProfilePage";
import ServiceBrowsingPage from "@/pages/ServiceBrowsingPage";
import { Button } from "@/components/ui/button";
export default function AppRouter() {
  console.log("Initializing router");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="signup" element={<RegisterPage />} />
          <Route path="listings" element={<ServiceListingsPage />} />
          <Route path="listings/:listingId" element={<ServiceListingDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="services" element={<ServiceBrowsingPage />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Page not found</p>
                  <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
