"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddReviewSection() {
  return (
    <section className="py-12 sm:py-14 lg:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Leave a Review</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Share your experience learning Arabic with Rose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddReviewForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function AddReviewForm() {
  const [form, setForm] = useState({
    name: "",
    accent: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!form.content.trim()) {
      setError("Please write your review.");
      return;
    }
    setSubmitting(true);
    try {
      // Send all required fields to API, with defaults for hidden fields
      const payload = { 
        id: 0, 
        ...form,
        rating: 5, // Default rating
        courseName: "", // Default empty course name
        profileImage: "" // Default empty profile image
      } as any;
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      // Attempt to read response (if backend returns JSON)
      try {
        await res.json();
      } catch {}

      setSuccess("Thank you! Your review has been submitted.");
      setForm({ name: "", accent: "", content: "" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Country"
          value={form.accent}
          onChange={(e) => setForm({ ...form, accent: e.target.value })}
        />
      </div>
      <Textarea
        placeholder="Write your review..."
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="min-h-28"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="min-w-[120px] sm:min-w-36 w-full sm:w-auto">
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
