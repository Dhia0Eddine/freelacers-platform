import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api";
import { ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();

  // State for admin creation modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  const handleCreateAdmin = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      await authService.register(adminEmail, adminPassword, "admin");
      setSuccess("Admin user created successfully.");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to create admin user.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Go Back Button */}
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>
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
            {/* Add button to open admin creation modal */}
            <Button variant="outline" onClick={() => setShowAdminModal(true)}>
              Create Admin User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin creation modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Admin Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              disabled={creating}
            />
            <Input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={creating}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAdminModal(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={creating || !adminEmail || !adminPassword}
            >
              {creating ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
