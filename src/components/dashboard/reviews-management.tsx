"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Review } from "@/types/api";
import { ReviewCard } from "@/components/cards/review-card";
import { Plus, Edit2, Trash2, Save, X, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ViewMode = "list" | "add" | "edit";

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    accent: "",
    content: "",
    profileImage: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Replace with your actual API call
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load testimonials");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReview = () => {
    setViewMode("add");
    setEditingReview(null);
    setFormData({
      name: "",
      accent: "",
      content: "",
      profileImage: ""
    });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setViewMode("edit");
    setFormData({
      name: review.name || "",
      accent: review.accent || "",
      content: review.content || "",
      profileImage: review.profileImage || ""
    });
  };

  const handleSaveReview = async () => {
    try {
      const mappedData = {
        id: 0,
        ...formData
      };
      let response;
      if (viewMode === "edit" && editingReview) {
        response = await fetch(`/api/testimonials/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mappedData),
        });
      } else {
        response = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mappedData),
        });
      }
      if (!response.ok) throw new Error("Failed to save review");
      toast.success(viewMode === "edit" ? "Review updated successfully" : "Review created successfully");
      fetchReviews();
      setViewMode("list");
      setEditingReview(null);
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/testimonials/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete review");
      fetchReviews();
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleApproveReview = async (review: Review) => {
    try {
      const mappedData = {
        id: review.id,
        name: review.name || "",
        accent: review.accent || "",
        content: review.content || "",
        rating: review.rating || 5,
        profileImage: review.profileImage || "",
        courseName: review.courseName || "",
        approved: true,
      };
      const response = await fetch(`/api/testimonials/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedData),
      });
      if (!response.ok) throw new Error("Failed to approve review");
      toast.success("Testimonial approved");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to approve review");
    }
  };

  const handleDisapproveReview = async (review: Review) => {
    try {
      const mappedData = {
        id: review.id,
        name: review.name || "",
        accent: review.accent || "",
        content: review.content || "",
        rating: review.rating || 5,
        profileImage: review.profileImage || "",
        courseName: review.courseName || "",
        approved: false,
      };
      const response = await fetch(`/api/testimonials/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedData),
      });
      if (!response.ok) throw new Error("Failed to disapprove review");
      toast.success("Testimonial disapproved");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to disapprove review");
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingReview(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Testimonials Management</CardTitle>
            <p className="text-gray-600 mt-2">
              Manage student testimonials and reviews
            </p>
          </div>
          <Button onClick={handleAddReview}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode !== "list" && (
          <div className="mb-4">
            <div className="space-y-4 p-4 border rounded-lg bg-white">
              <h2 className="text-lg font-semibold mb-2">{viewMode === "add" ? "Add Testimonial" : "Edit Testimonial"}</h2>
              <Input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Country"
                value={formData.accent}
                onChange={e => setFormData({ ...formData, accent: e.target.value })}
              />
              <Textarea
                placeholder="Content"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Profile Image URL"
                value={formData.profileImage}
                onChange={e => setFormData({ ...formData, profileImage: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveReview}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Approved Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Approved</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.filter(r => r.approved === true).map((review) => (
              <div key={review.id} className="relative group">
                <ReviewCard review={review} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button variant="default" onClick={() => handleDisapproveReview(review)}>
                      <X className="h-4 w-4 mr-1" /> Disapprove
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEditReview(review)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this testimonial?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReview(String(review.id))}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Not Approved Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Not Approved</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.filter(r => r.approved !== true).map((review) => (
              <div key={review.id} className="relative group">
                <ReviewCard review={review} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button variant="default" onClick={() => handleApproveReview(review)}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEditReview(review)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this testimonial?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReview(String(review.id))}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}