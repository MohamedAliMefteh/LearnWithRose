"use client";

import React from "react";
import { Review } from "@/types/api";
import { ReviewCard } from "@/components/cards/review-card";

export interface TestimonialsSectionProps {
  loading: boolean;
  reviews: Review[];
}

export default function TestimonialsSection({ loading, reviews }: TestimonialsSectionProps) {
  // If not loading and there are no reviews, don't render the section
  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-secondary/10 via-card/10 to-background/20 relative">
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
            What Students Say
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto px-4">
            Hear from learners who have transformed their Arabic pronunciation
            and cultural understanding.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
