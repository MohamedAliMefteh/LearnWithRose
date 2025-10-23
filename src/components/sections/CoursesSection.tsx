"use client";

import React, { useState } from "react";
import { Course } from "@/types/api";
import { CourseCard } from "@/components/cards/course-card";
import { CourseDetailsModal } from "@/components/cards/course-details-modal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface CoursesSectionProps {
  loading: boolean;
  courses: Course[];
  onEnroll: (course?: Course | null) => void;
}

const ITEMS_PER_PAGE = 6;

export default function CoursesSection({
  loading,
  courses,
  onEnroll,
}: CoursesSectionProps) {
  // Internal modal state moved into CoursesSection to encapsulate courses logic
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleInquiry = (courseId: string | number) => {
    const course = courses.find((c) => c.id === courseId) || null;
    setModalCourse(course);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  // Pagination logic
  const sortedCourses = [...courses].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  const totalPages = Math.ceil(sortedCourses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCourses = sortedCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} onInquiry={handleInquiry} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

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
          </>
        )}
      </div>
    </section>
  );
}
