import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Play } from "lucide-react";
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
        {/* Hero + Title */}
        <div className="relative isolate p-6 sm:p-8 md:p-10 bg-gradient-to-br from-white via-accent/10 to-secondary/10">
          <div className="absolute -top-16 -right-16 size-40 sm:size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-40 sm:size-56 rounded-full bg-accent/10 blur-3xl" />

          <div className="flex items-start gap-4 sm:gap-6">
            <div className="shrink-0 inline-flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-white/80 border border-primary/20 shadow-md">
              <Play className="size-7 sm:size-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight whitespace-normal break-words">
                {course.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge variant="secondary" className="capitalize">{course.accent} dialect</Badge>
                <Badge className="capitalize">{course.level}</Badge>
                <div className="ml-auto hidden sm:flex items-center gap-4 text-sm text-foreground/80">
                  <div className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</div>
                  <div className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{course.students} students</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 p-6 sm:p-8 flex-1 overflow-y-auto">
          {/* Description */}
          <div className="md:col-span-2 rounded-xl border border-primary/10 bg-white/70 backdrop-blur p-4 sm:p-6 overflow-y-auto">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-lg sm:text-xl font-bold text-primary">Course Description</DialogTitle>
              <DialogDescription className="sr-only">Detailed description of the selected course</DialogDescription>
            </DialogHeader>
            <div className="prose max-w-none text-foreground/90 leading-relaxed text-sm sm:text-base [&_button]:hidden [&_.button]:hidden [&_.btn]:hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.description}</ReactMarkdown>
            </div>
          </div>

          {/* At a glance (only) */}
          <div className="space-y-4 md:space-y-6">
            <div className="rounded-xl border border-primary/10 bg-white/70 backdrop-blur p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-primary mb-3">At a glance</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col rounded-lg border border-primary/10 p-3">
                  <span className="text-xs text-foreground/60">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex flex-col rounded-lg border border-primary/10 p-3">
                  <span className="text-xs text-foreground/60">Students</span>
                  <span className="font-medium">{course.students}</span>
                </div>
                <div className="flex flex-col rounded-lg border border-primary/10 p-3">
                  <span className="text-xs text-foreground/60">Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex flex-col rounded-lg border border-primary/10 p-3">
                  <span className="text-xs text-foreground/60">Price</span>
                  <span className="font-bold text-primary">${course.price}</span>
                </div>
              </div>
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
