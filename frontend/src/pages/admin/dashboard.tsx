import React, { useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={() => navigate("/admin/users")}>Manage Users</Button>
            <Button onClick={() => navigate("/admin/listings")}>Manage Listings</Button>
            <Button onClick={() => navigate("/admin/requests")}>Manage Requests</Button>
            <Button onClick={() => navigate("/admin/services")}>Manage Services</Button>
            <Button onClick={() => navigate("/admin/categories")}>Manage Categories</Button>
            <Button onClick={() => navigate("/admin/reviews")}>Manage Reviews</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
