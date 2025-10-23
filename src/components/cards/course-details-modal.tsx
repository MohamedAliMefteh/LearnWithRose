import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { Course } from "@/types/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CourseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onEnroll?: (course: Course) => void;
}

export function CourseDetailsModal({ open, onClose, course, onEnroll }: CourseDetailsModalProps) {
  if (!course) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] p-0 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-primary/10 flex flex-col">
        {/* Compact Header with Title + At a glance */}
        <div className="relative isolate p-3 sm:p-4 bg-gradient-to-br from-white via-accent/10 to-secondary/10 border-b border-primary/10">
          <div className="absolute -top-16 -right-16 size-40 sm:size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-40 sm:size-56 rounded-full bg-accent/10 blur-3xl" />

          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="shrink-0 inline-flex items-center justify-center size-8 sm:size-10 rounded-lg bg-white/80 border border-primary/20 shadow-md">
              <BookOpen className="size-4 sm:size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-primary leading-tight whitespace-normal break-words">
                {course.title}
              </h2>
              <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary" className="capitalize text-xs sm:text-sm py-0.5 px-2 sm:px-2.5">{course.accent}</Badge>
                <Badge className="capitalize text-xs sm:text-sm py-0.5 px-2 sm:px-2.5">{course.level}</Badge>
              </div>
            </div>
          </div>

          {/* At a glance - Icon + Value only */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-white/50 backdrop-blur px-2 sm:px-2.5 py-1 sm:py-1.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-foreground">{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-white/50 backdrop-blur px-2 sm:px-2.5 py-1 sm:py-1.5">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-foreground">{course.students}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-primary/10 bg-white/50 backdrop-blur px-2 sm:px-2.5 py-1 sm:py-1.5">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70 shrink-0" />
              <span className="font-medium capitalize text-xs sm:text-sm text-foreground">{course.level}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-primary/10 bg-white/50 backdrop-blur px-2 sm:px-2.5 py-1 sm:py-1.5">
              <span className="text-primary text-xs sm:text-sm font-bold">${course.price}</span>
            </div>
          </div>
        </div>

        {/* Description - Full width, maximum space */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Course Description</DialogTitle>
              <DialogDescription className="sr-only">Detailed description of the selected course</DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/90 leading-relaxed [&_button]:hidden [&_.button]:hidden [&_.btn]:hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex justify-center">
          <Button onClick={() => onEnroll?.(course)} className="bg-primary text-white hover:bg-primary/90 w-full sm:w-2/3 md:w-1/2 text-base py-6">
            Enroll
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
