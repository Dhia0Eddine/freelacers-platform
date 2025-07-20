// src/routes/index.tsx
import { createBrowserRouter, Route, RouterProvider } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import ProfileSetupPage from "../pages/ProfileSetupPage"
import HomePage from "../pages/HomePage"
import ProfilePage from "../pages/ProfilePage";
import EditProfilePage from "../pages/EditProfilePage";
import ApiDebugPage from "../pages/ApiDebugPage";
import UserProfilePage from "../pages/UserProfilePage";
import ServiceListingsPage from "../pages/ServiceListingsPage";
import ServiceListingDetailPage from "../pages/ServiceListingDetailPage";
import ServiceBrowsingPage from "../pages/ServiceBrowsingPage";
import ListingsPagebyServiceId from "../pages/ListingsPagebyServiceId";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <RegisterPage /> },
      { path: "profile-setup", element: <ProfileSetupPage /> },
      { path: "profile/me", element: <ProfilePage /> },
      { path: "profile/edit", element: <EditProfilePage /> },
      { path: "profile/:userId", element: <UserProfilePage /> },
      { path: "services", element: <ServiceBrowsingPage /> },
      { path: "listings/service/:serviceId", element: <ListingsPagebyServiceId /> }, // Add this new route
      { path: "listings/:listingId", element: <ServiceListingDetailPage /> },
      
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />;
}
