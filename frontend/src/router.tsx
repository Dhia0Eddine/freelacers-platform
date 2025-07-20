import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";
import ServiceListingsPage from "@/pages/ServiceListingsPage";
import ServiceListingDetailPage from "@/pages/ServiceListingDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import UserProfilePage from "@/pages/UserProfilePage";

export default function AppRouter() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
