// Helper to strip HTML and limit preview length
function getPreview(html: string, maxLength: number) {
  if (typeof window !== 'undefined') {
    const tmp = window.document.createElement("div");
    tmp.innerHTML = html;
    var text = tmp.textContent || tmp.innerText || "";
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  }
  return "";
}
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Clock, Users } from "lucide-react";
import { Course } from "@/types/api";

interface CourseCardProps {
  course: Course;
  onInquiry?: (courseId: string | number) => void;
  showDetailsButton?: boolean;
}

// Removed duplicate declaration
export function CourseCard({ course, onInquiry, showDetailsButton = true }: CourseCardProps) {
  return (
  <Card className="border-[hsl(var(--secondary-yellow))] hover:shadow-lg transition-shadow w-full max-w-md mx-auto md:max-w-none">
  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center">
        <Play className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
      </div>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
          <Badge
            variant={
              course.accent === "palestinian" ? "default" : "secondary"
            }
          >
            {course.accent === "palestinian" ? "Palestinian" : "Lebanese"}
          </Badge>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-secondary fill-current" />
            <span className="ml-1 text-sm font-medium text-secondary">{course.rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg sm:text-xl">{course.title}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {getPreview(course.description, 120)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-xs sm:text-sm text-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {course.duration}
          </div>
          <div className="flex items-center text-xs sm:text-sm text-foreground">
            <Users className="h-4 w-4 mr-2" />
            {course.students} students
          </div>
          <div className="text-xs sm:text-sm text-foreground">
            Level: <span className="capitalize font-medium">{course.level}</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-primary">${course.price}</div>
        </div>
        {showDetailsButton && onInquiry && (
          <Button className="w-full" onClick={() => onInquiry(course.id)}>
            Get Course Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
