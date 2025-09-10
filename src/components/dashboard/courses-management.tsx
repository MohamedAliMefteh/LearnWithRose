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
import { Plus, Edit2, Trash2, ArrowLeft, Shield, GripVertical } from "lucide-react";
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
import { InquiriesManagement } from "./inquiries-management";

type ViewMode = "list" | "add" | "edit";

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);

  // Helper to move array item
  const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  // Check for unsaved order changes by comparing to saved snapshot
  const hasOrderChanges = (() => {
    if (!savedCourses.length || !courses.length) return false;
    const savedMap = new Map(savedCourses.map(c => [String(c.id), c.order] as const));
    return courses.some(c => savedMap.get(String(c.id)) !== c.order);
  })();

  // Save current order to backend
  const saveOrder = async () => {
    if (!hasOrderChanges) return;
    setIsSavingOrder(true);
    const loadingId = toast.loading('Saving new order...');
    try {
      const savedOrderMap = new Map(savedCourses.map(c => [String(c.id), c.order] as const));
      const savedById = new Map(savedCourses.map(c => [String(c.id), c] as const));

      const changedCourses = courses.filter(c => savedOrderMap.get(String(c.id)) !== c.order);

      if (changedCourses.length === 0) {
        toast.info('No changes to save');
      } else {
        await Promise.allSettled(
          changedCourses.map(c => {
            const base = savedById.get(String(c.id)) || c;
            const { id: _omit, ...rest } = base as any;
            const fullPayload = { ...rest, order: c.order } as Partial<Course>;
            return coursesAPI.update(c.id, fullPayload);
          })
        );
        toast.success('Order updated');
        // Update snapshot to current
        setSavedCourses(courses);
      }
    } catch (err) {
      console.error('Failed to save order', err);
      toast.error('Failed to save order');
      // Optionally refetch in case of severe mismatch
      await fetchCourses();
    } finally {
      toast.dismiss(loadingId);
      setIsSavingOrder(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
      setSavedCourses(data);
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
      {/* Courses Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Courses Management
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Manage the courses displayed on your homepage
                {!token && (
                  <span className="text-[#0420bf]"> (Creating/editing requires authentication)</span>
                )}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              {hasOrderChanges && (
                <Button
                  onClick={saveOrder}
                  disabled={isSavingOrder}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Save order
                </Button>
              )}
              <Button
                onClick={handleAddCourse}
                className=""
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-gray-500">Drag using the handle to reorder courses. Don’t forget to click <span className="font-medium text-gray-700">Save order</span>.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Courses reorder list">
            {(() => {
              const sorted = [...courses].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
              return sorted.map((course, index) => (
                <div
                  key={course.id}
                  role="listitem"
                  className={`relative group rounded-md transition-all duration-200 ${
                    dragIndex === index ? 'ring-2 ring-primary/50 shadow-lg scale-[0.99]' : ''
                  } ${hoverIndex === index && dragIndex !== null ? 'ring-2 ring-primary/30' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragIndex !== null && hoverIndex !== index) setHoverIndex(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const src = dragIndex ?? parseInt(e.dataTransfer.getData('text/plain'));
                    if (src === null || isNaN(Number(src)) || src === index) {
                      setHoverIndex(null);
                      return;
                    }
                    const newSorted = arrayMove(sorted, Number(src), index);
                    const updated = newSorted.map((c, i) => ({ ...c, order: i + 1 }));
                    setCourses(updated);
                    setDragIndex(null);
                    setHoverIndex(null);
                  }}
                  onDragLeave={() => {
                    setHoverIndex((h) => (h === index ? null : h));
                  }}
                >
                  {/* Drag handle */}
                  <div className="absolute -left-2 -top-2 z-10">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/90 backdrop-blur rounded shadow cursor-grab active:cursor-grabbing border border-gray-200"
                      draggable
                      aria-label={`Drag handle for ${course.title}`}
                      onDragStart={(e) => {
                        setDragIndex(index);
                        e.dataTransfer.setData('text/plain', String(index));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setHoverIndex(null);
                      }}
                    >
                      <GripVertical className="w-3 h-3 text-gray-500" />
                      Drag
                    </button>
                  </div>

                  {/* Visual drop indicator when hovering */}
                  {hoverIndex === index && dragIndex !== null && (
                    <div className="absolute -inset-1 rounded-md border-2 border-dashed border-primary/40 pointer-events-none" />
                  )}

                  <div className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-md overflow-hidden">
                    <CourseCard
                      course={course}
                      showDetailsButton={false}
                    />
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                        onClick={() => handleEditCourse(course)}
                        disabled={isSavingOrder}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700"
                            disabled={isSavingOrder}
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
              ));
            })()}
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

      {/* Course Statistics Section */}
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
                {courses.filter(c => c.accent === "jordanian").length}
              </div>
              <div className="text-sm text-gray-600">Jordanian Courses</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {courses.reduce((sum, course) => sum + (parseInt(String(course.students)) || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Management Section */}
      <InquiriesManagement />
    </div>
  );
}
