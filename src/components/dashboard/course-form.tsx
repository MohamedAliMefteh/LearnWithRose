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
    level: course?.level || "Beginner",
    duration: course?.duration || "",
    price: course?.price || "",
    students: course?.students || "",
    rating: course?.rating || 5.0,
    image: course?.image || "/placeholder.svg",
    thumbnail: typeof course?.thumbnail === 'string' ? course.thumbnail : "",
    order: (course?.order ?? 1).toString(),
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      order: parseInt(formData.order, 10) || 0,
      rating: 5,
      // pass the File if selected; the API layer will detect and send multipart
      thumbnailFile: thumbnailFile || undefined,
    } as any;

    if (course) {
      // Editing existing course
      onSave({ ...course, ...payload });
    } else {
      // Adding new course
      onSave(payload);
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
              <Input
                required
                list="level-options"
                value={formData.level || ""}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="e.g. Beginner or type your own"
              />
              <datalist id="level-options">
                <option value="Beginner" />
              </datalist>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($) *</label>
              <Input
                type="text"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="299"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Students *</label>
              <Input
                type="text"
                required
                value={formData.students}
                onChange={(e) =>
                  setFormData({ ...formData, students: e.target.value })
                }
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail URL</label>
              <Input
                type="text"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="/thumbnail.png (optional if you upload a file)"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order *</label>
              <Input
                type="number"
                required
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="1"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail File *</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Upload the image shown on the course card. If you provide a URL above, file upload will take precedence.</p>
            </div>
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
