import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  const { userRole } = useAuthContext();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "admin") navigate("/");
  }, [userRole, navigate]);

  useEffect(() => {
    adminService.fetchAllReviews().then(setReviews).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await adminService.deleteReview(id);
    setReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Reviews</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Reviewee</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>Loading...</TableCell>
            </TableRow>
          ) : reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>No reviews found.</TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.id}</TableCell>
                <TableCell>{review.booking_id}</TableCell>
                <TableCell>{review.reviewer_id}</TableCell>
                <TableCell>{review.reviewee_id}</TableCell>
                <TableCell>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {review.rating}
                  </span>
                </TableCell>
                <TableCell>{review.comment || ""}</TableCell>
                <TableCell>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)}>
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
