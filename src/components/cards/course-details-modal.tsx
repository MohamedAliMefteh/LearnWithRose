import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Course } from "@/types/api";

interface CourseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
}

export function CourseDetailsModal({ open, onClose, course }: CourseDetailsModalProps) {
  if (!course) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl h-[90vh] max-h-[90vh] p-0 rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Upper Section: Title & Details */}
  <div className="p-6 sm:p-10 bg-gradient-to-r from-primary/10 to-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-12 border-b-2 border-[hsl(var(--secondary-yellow))]">
          <div className="flex-1 w-full">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary mb-4 text-center md:text-left">{course.title}</h2>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-base sm:text-lg justify-center md:justify-start">
              <span className="bg-primary/10 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Accent:</strong> <span className="capitalize text-accent">{course.accent}</span></span>
              <span className="bg-secondary/20 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Level:</strong> <span className="capitalize text-primary">{course.level}</span></span>
              <span className="bg-primary/10 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Duration:</strong> <span className="text-primary">{course.duration}</span></span>
              <span className="bg-secondary/20 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Students:</strong> <span className="text-primary">{course.students}</span></span>
              <span className="bg-primary/10 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Price:</strong> <span className="text-primary font-bold">${course.price}</span></span>
              <span className="bg-secondary/20 px-3 py-1 sm:px-4 sm:py-2 rounded-lg"><strong>Rating:</strong> <span className="text-primary">{course.rating}</span></span>
            </div>
          </div>
          {/* Removed custom close icon, using Dialog's built-in close icon */}
        </div>
        {/* Lower Section: Description */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4">Course Description</h3>
          <div className="text-base sm:text-xl text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
