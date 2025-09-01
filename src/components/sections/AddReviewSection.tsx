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
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>
              Share your experience and help others choose the right course.
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
    courseName: "",
    rating: 5 as number,
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
    if (form.rating < 1 || form.rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { id: 0, ...form } as any;
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
      setForm({ name: "", accent: "", courseName: "", rating: 5, content: "" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Accent (e.g., Palestinian, Jordanian)"
          value={form.accent}
          onChange={(e) => setForm({ ...form, accent: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Course Name (optional)"
          value={form.courseName}
          onChange={(e) => setForm({ ...form, courseName: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Rating</label>
          <Input
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-28"
          />
        </div>
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
        <Button type="submit" disabled={submitting} className="min-w-36">
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
