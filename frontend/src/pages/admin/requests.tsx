import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default function AdminRequestsPage() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  useEffect(() => {
    adminService.fetchAllRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Go Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">All Requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preferred Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Loading...</TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>No requests found.</TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.customer_name || req.user_id}</TableCell>
                <TableCell>{req.listing_title || req.listing_id}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>{req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : ""}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => adminService.deleteRequest(req.id).then(() => setRequests(requests.filter(r => r.id !== req.id)))}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
