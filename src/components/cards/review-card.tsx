"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Review } from "@/types/api";
import { Star } from "lucide-react";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-white to-slate-50/50 shadow-md hover:shadow-xl transition-all duration-300 h-full">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-bl-[100px] -z-0" />
      
      <CardContent className="relative p-6 sm:p-8 flex flex-col h-full">
        {/* Review Content */}
        <blockquote className="text-slate-700 leading-relaxed mb-6 flex-1 text-base sm:text-lg font-light">
          {review.content}
        </blockquote>
        
        {/* Reviewer Info */}
        <div className="flex items-center gap-4">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-sm opacity-50" />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center ring-4 ring-white">
              <span className="text-white font-bold text-lg sm:text-xl">
                {review.name ? review.name[0].toUpperCase() : "?"}
              </span>
            </div>
          </div>
          
          {/* Name and Location */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 text-base sm:text-lg">
              {review.name}
            </div>
            <div className="text-sm sm:text-base text-slate-500">
              {review.accent}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
