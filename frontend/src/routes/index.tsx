// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AppLayout from "../layout/AppLayout"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import HomePage from "../pages/HomePage"


export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <RegisterPage /> }, // Changed from "register" to "signup"
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />;
}
