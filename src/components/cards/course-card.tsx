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
  const resolveMediaUrl = (url?: string) => {
    if (!url) return "/placeholdercourse.jpg";

    // 0) Already a data URI
    if (url.startsWith("data:")) return url;

    // 1) Detect raw Base64 (common signatures + simple heuristic)
    const trimmed = url.trim();
    const looksBase64 = (
      trimmed.startsWith("/9j/") ||     // JPEG
      trimmed.startsWith("iVBORw0K") || // PNG
      trimmed.startsWith("R0lGOD") ||   // GIF
      (trimmed.length > 200 && /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed))
    );

    if (looksBase64) {
      // Guess MIME type by signature; default to JPEG
      let mime = "image/jpeg";
      if (trimmed.startsWith("iVBORw0K")) mime = "image/png";
      else if (trimmed.startsWith("R0lGOD")) mime = "image/gif";

      // Some backends include a leading slash (e.g., "/9j/") – strip it
      const base64Payload = trimmed.replace(/^\/+/, "");
      return `data:${mime};base64,${base64Payload}`;
    }

    // 2) If absolute URL, return as-is
    if (/^https?:\/\//i.test(url)) return url;

    // 3) Backend-relative paths
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    if (url.startsWith("/")) return `${base}${url}`;

    // 4) Fallback
    return url;
  };

  const imgSrc = resolveMediaUrl(course.thumbnail || course.image || "/placeholdercourse.jpg");

  return (
    <Card className="border-[hsl(var(--secondary-yellow))] hover:shadow-lg transition-shadow w-full h-full flex flex-col">
      <div className="aspect-video rounded-t-lg overflow-hidden">
        <img
          src={imgSrc}
          alt={course.title || "Course image"}
          className="w-full h-full object-cover"
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
