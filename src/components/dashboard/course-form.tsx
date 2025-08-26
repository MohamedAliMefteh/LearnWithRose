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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course } from "@/types/api";

interface CourseFormProps {
  course?: Course;
  onSave: (course: Omit<Course, "id"> | Course) => void;
  onCancel: () => void;
}

export function CourseForm({ course, onSave, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    accent: course?.accent || "",
    level: course?.level || "beginner",
    duration: course?.duration || "",
    price: course?.price || 0,
    students: course?.students || 0,
    rating: course?.rating || 5.0,
    image: course?.image || "/placeholder.svg",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      // Editing existing course
      onSave({ ...course, ...formData });
    } else {
      // Adding new course
      onSave({ ...formData, rating: 5 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course ? "Edit Course" : "Add New Course"}</CardTitle>
        <CardDescription>
          {course ? "Update course information" : "Create a new course for your students"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Course title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration *</label>
              <Input
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g. 8 weeks"
              />
            </div>
          </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Markdown supported) *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write the course description in Markdown (e.g., headings, lists, bold, links)"
                  className="min-h-[220px] font-mono"
                />
                <p className="text-xs text-muted-foreground">Tip: Use Markdown syntax like # Heading, **bold**, *italic*, - lists, and [links](https://example.com).</p>
              </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dialect *</label>
              <Input
                required
                list="dialect-options"
                value={formData.accent || ""}
                onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                placeholder="e.g. Palestinian-Jordanian or type your own"
              />
              <datalist id="dialect-options">
                <option value="Palestinian-Jordanian" />
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level *</label>
              <Select
                value={formData.level}
                onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($) *</label>
              <Input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                }
                placeholder="299"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Students *</label>
              <Input
                type="number"
                required
                min="0"
                value={formData.students}
                onChange={(e) =>
                  setFormData({ ...formData, students: parseInt(e.target.value) || 0 })
                }
                placeholder="150"
              />
            </div>
            {course && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating *</label>
                <Input
                  type="number"
                  required
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })
                  }
                  placeholder="4.9"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit">
              {course ? "Update Course" : "Add Course"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
