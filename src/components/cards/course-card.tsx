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
import { Clock, Users, Star, BookOpen, Award, TrendingUp } from "lucide-react";
import { Course } from "@/types/api";
import { convertByteDataToImageUrl, getFallbackImage } from "@/lib/image-utils";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
  onInquiry?: (courseId: string | number) => void;
  showDetailsButton?: boolean;
}

// Modern CourseCard with enhanced design and animations
export function CourseCard({ course, onInquiry, showDetailsButton = true }: CourseCardProps) {
  // Use our standardized utility function for consistent byte data handling
  const thumbnailUrl = convertByteDataToImageUrl(
    course.thumbnail || course.image, 
    getFallbackImage('course')
  );
  
  const [isHovered, setIsHovered] = useState(false);
  const rating = 4.7; // Mock rating - replace with actual data
  const enrolledCount = parseInt(course.students) || 0;

  return (
    <Card 
      className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 w-full h-full flex flex-col backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Modern gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-[1px]">
        <div className="bg-white rounded-3xl h-full w-full" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Enhanced hero image section */}
        <div 
          className="relative h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group-hover:scale-105 transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Modern layered gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
          
          {/* Floating price badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40">
              <span className="text-sm font-bold text-slate-900">${course.price}</span>
            </div>
          </div>
          
          {/* Accent/Language badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-primary/90 backdrop-blur-md text-white border-primary/30 px-3 py-1.5 capitalize">
              {course.accent}
            </Badge>
          </div>
          
          {/* Level indicator */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-2xl">
              <Award className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium capitalize">{course.level}</span>
            </div>
          </div>
          
          {/* Rating badge */}
          <div className="absolute bottom-4 right-4 z-20">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="text-sm font-bold text-slate-900">{rating}</span>
            </div>
          </div>
          
        </div>
        
        {/* Content section */}
        <div className="flex-1 flex flex-col p-6">
          {/* Title and quick stats */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {getPreview(course.description, 100)}
            </p>
          </div>
          
          {/* Course stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Duration</p>
                <p className="text-sm font-semibold">{course.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Students</p>
                <p className="text-sm font-semibold">{enrolledCount > 1000 ? `${Math.floor(enrolledCount/1000)}k+` : course.students}</p>
              </div>
            </div>
          </div>
          
          
          {/* Action button */}
          {showDetailsButton && onInquiry && (
            <Button 
              className="w-full rounded-2xl py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
              onClick={() => onInquiry(course.id)}
            >
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
