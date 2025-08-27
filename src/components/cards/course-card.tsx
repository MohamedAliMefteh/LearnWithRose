// Helper to strip Markdown/HTML and limit preview length
function decodeEntities(str: string) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripMarkdown(input: string) {
  if (!input) return "";
  let text = input
    // Normalize line breaks
    .replace(/\r\n?|\n/g, "\n")
    // Remove fenced code blocks ``` ``` and ~~~ ~~~
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    // Remove inline code `code`
    .replace(/`[^`]*`/g, " ")
    // Images ![alt](url) -> alt
    .replace(/!\[([^\]]*)\]\([^\)]*\)/g, "$1")
    // Links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1")
    // Reference-style links: [text][id] -> text
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    // Remove link definitions: [id]: url "title"
    .replace(/^\s*\[[^\]]+\]:\s+\S+.*$/gm, "")
    // Autolinks <http://...> -> remove URL
    .replace(/<https?:\/\/[^>]+>/gi, " ")
    // ATX headings with/without space after #
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    // Blockquotes > or >>
    .replace(/^\s{0,3}>+\s?/gm, "")
    // Lists: -, *, +, or ordered lists
    .replace(/^\s{0,3}([*+-]|\d+\.)\s+/gm, "")
    // Setext heading underline lines (=== or ---)
    .replace(/^\s{0,3}(=+|-+)\s*$/gm, "")
    // Tables: remove header separators and turn pipes into spaces
    .replace(/^\s*[:\-| ]+\|[:\-\| ]+\s*$/gm, "")
    .replace(/\|/g, " ")
    // Emphasis/strong/strike markers left over
    .replace(/[*_~]{1,3}/g, "")
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, " ")
    // Collapse multiple newlines and spaces
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Decode common HTML entities
  text = decodeEntities(text);
  return text;
}

function getPreview(textOrMarkdown: string, maxLength: number) {
  const text = stripMarkdown(textOrMarkdown);
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
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
import { Clock, Users } from "lucide-react";
import { Course } from "@/types/api";

interface CourseCardProps {
  course: Course;
  onInquiry?: (courseId: string | number) => void;
  showDetailsButton?: boolean;
}

// Removed duplicate declaration
export function CourseCard({ course, onInquiry, showDetailsButton = true }: CourseCardProps) {
  return (
    <Card className="border-[hsl(var(--secondary-yellow))] hover:shadow-lg transition-shadow w-full h-full flex flex-col">
      <div className="aspect-video rounded-t-lg overflow-hidden">
        <img
          src="/placeholdercourse.jpg"
          alt={course.title || "Course image"}
          className="w-full h-full object-cover scale-150"
          loading="lazy"
        />
      </div>
      <CardHeader className="flex-1 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
          <Badge
            variant={
              course.accent === "palestinian" ? "default" : "secondary"
            }
          >
            {course.accent}
          </Badge>
        </div>
        <CardTitle className="text-base sm:text-lg">{course.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {getPreview(course.description, 70)}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
