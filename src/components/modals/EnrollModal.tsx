"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactSection from "@/components/sections/ContactSection";
import { Course } from "@/types/api";

interface EnrollModalProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  selectedCourse?: string;
}

export default function EnrollModal({
  open,
  onClose,
  courses,
  selectedCourse,
}: EnrollModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
            Start Your Arabic Journey
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ContactSection
            courses={courses}
            selectedCourse={selectedCourse}
            isModal={true}
            onSubmitSuccess={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
