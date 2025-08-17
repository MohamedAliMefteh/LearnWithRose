"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/cards/course-card";
import { CourseForm } from "./course-form";
import { coursesAPI } from "@/lib/courses-api";
import { Course } from "@/types/api";
import { Plus, Edit2, Trash2, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
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

type ViewMode = "list" | "add" | "edit";

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = () => {
    setViewMode("add");
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setViewMode("edit");
  };

  const handleSaveCourse = async (courseData: Omit<Course, "id"> | Course) => {
    try {
      if (viewMode === "edit" && editingCourse) {
        // Update existing course
        await coursesAPI.update(editingCourse.id, courseData);
        toast.success('Course updated successfully');
      } else {
        // Add new course
        await coursesAPI.create(courseData as Omit<Course, "id">);
        toast.success('Course created successfully');
      }
      await fetchCourses();
      setViewMode("list");
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to save course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save course';
      toast.error(errorMessage);

      // Log additional details for debugging
      if (error instanceof Error && error.message.includes('500')) {
        toast.error('Backend server is experiencing issues. Please try again later.');
      }
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    try {
      await coursesAPI.delete(courseId);
      await fetchCourses();
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Failed to delete course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
      toast.error(errorMessage);

      // Log additional details for debugging
      if (error instanceof Error && error.message.includes('500')) {
        toast.error('Backend server is experiencing issues. Please try again later.');
      }
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingCourse(null);
  };

  const handleCourseInquiry = (courseId: string | number) => {
    // In dashboard context, we don't need to handle inquiries
  };

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
        <CourseForm
          course={editingCourse || undefined}
          onSave={handleSaveCourse}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Courses Management
                {token && (
                  <div className="flex items-center text-sm text-green-600">
                    <Shield className="h-4 w-4 mr-1" />
                    Authenticated
                  </div>
                )}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Manage the courses displayed on your homepage
                {!token && (
                  <span className="text-orange-600"> (Creating/editing requires authentication)</span>
                )}
              </p>
            </div>
            <Button onClick={handleAddCourse}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative group">
                <CourseCard
                  course={course}
                  showDetailsButton={false}
                />
                <div className="absolute top-2 right-2 opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 backdrop-blur-sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCourse(course.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
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
          {courses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No courses available</p>
              <Button onClick={handleAddCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{courses.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.accent === "palestinian").length}
              </div>
              <div className="text-sm text-gray-600">Palestinian Courses</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {courses.filter(c => c.accent === "lebanese").length}
              </div>
              <div className="text-sm text-gray-600">Lebanese Courses</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {courses.reduce((sum, course) => sum + course.students, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
