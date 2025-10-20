"use client";

import React, { useState } from "react";
import { Course } from "@/types/api";
import { CourseCard } from "@/components/cards/course-card";
import { CourseDetailsModal } from "@/components/cards/course-details-modal";

export interface CoursesSectionProps {
  loading: boolean;
  courses: Course[];
  onEnroll: (course?: Course | null) => void;
}

export default function CoursesSection({
  loading,
  courses,
  onEnroll,
}: CoursesSectionProps) {
  // Internal modal state moved into CoursesSection to encapsulate courses logic
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<Course | null>(null);

  const handleInquiry = (courseId: string | number) => {
    const course = courses.find((c) => c.id === courseId) || null;
    setModalCourse(course);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  return (
    <section
      id="courses"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-secondary/10 via-card/10 to-background/20 relative"
    >
      <div
        className="absolute top-0 left-0 w-full h-12 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(var(--background))/60 80%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--foreground))] mb-3 sm:mb-4">
            Arabic Dialect Courses
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto px-4">
            Choose from our carefully crafted courses designed to help you
            master Palestinian-Jordanian Dialects.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {([...courses]
              .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((course) => (
                <CourseCard key={course.id} course={course} onInquiry={handleInquiry} />
              )))}
            {/* Course Details Modal */}
            <CourseDetailsModal
              open={modalOpen}
              onClose={handleCloseModal}
              course={modalCourse}
              onEnroll={(course) => {
                onEnroll(course);
                setModalOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
