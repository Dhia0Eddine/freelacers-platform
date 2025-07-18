import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import RegisterPage from "@/pages/RegisterPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="signup" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
