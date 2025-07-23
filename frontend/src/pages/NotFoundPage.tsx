import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-5xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );
}
