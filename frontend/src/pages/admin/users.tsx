import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  useEffect(() => {
    adminService.fetchAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleStatusToggle = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    await adminService.updateUserStatus(userId, newStatus);
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

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
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>Loading...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>No users found.</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.status === "enabled"}
                    onCheckedChange={() => handleStatusToggle(user.id, user.status)}
                  />
                  <span className="ml-2">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => adminService.deleteUser(user.id).then(() => setUsers(users.filter(u => u.id !== user.id)))}
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
