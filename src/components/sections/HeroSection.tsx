"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BioData } from "@/types/api";

function FlagPalestine({ className = "w-5 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3 2"
      className={`inline-block align-middle ${className}`}
      aria-label="Palestinian flag"
      role="img"
    >
      <title>Palestinian flag</title>
      <rect width="3" height="0.6667" y="0" fill="#000000" />
      <rect width="3" height="0.6667" y="0.6667" fill="#FFFFFF" />
      <rect width="3" height="0.6667" y="1.3333" fill="#007A3D" />
      <polygon points="0,0 1,1 0,2" fill="#CE1126" />
    </svg>
  );
}

type HeroSectionProps = {
  bioData: BioData | null;
  loading: boolean;
  scrollToSection: (sectionId: string) => void;
};

export default function HeroSection({ bioData, loading, scrollToSection }: HeroSectionProps) {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-48 rounded-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  {bioData?.heroSection?.tag && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-accent/10 border border-primary/20 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary))]/80 transition-colors">
                        {bioData.heroSection.tag} <span className="align-middle">✌🏽</span>{" "}
                        <FlagPalestine className="w-5 h-3 ml-1" />
                        <FlagPalestine className="w-5 h-3 ml-1" />
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] leading-tight tracking-tight text-center sm:text-left">
                    {bioData?.heroSection?.title || "Loading..."}
                  </h1>
                  {bioData?.heroSection?.description && (
                    <div className="prose prose-sm sm:prose md:prose-lg max-w-prose mx-auto sm:mx-0 text-[hsl(var(--foreground))] text-center sm:text-left">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {bioData.heroSection.description}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                onClick={() => scrollToSection("courses")}
              >
                Explore Courses
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => scrollToSection("contact-form")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Learning Today
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center space-x-8 pt-4 justify-center sm:justify-start">
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              </div>
            ) : (
              bioData?.heroSection?.stats && (
                <div className="flex items-center space-x-8 pt-4 justify-center sm:justify-start">
                  {bioData.heroSection.stats.studentsTaught && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                        {bioData.heroSection.stats.studentsTaught}
                      </div>
                      <div className="text-sm font-semibold text-[hsl(var(text-gray-800))]">
                        Students Taught
                      </div>
                    </div>
                  )}
                  {bioData.heroSection.stats.averageRating && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                        {bioData.heroSection.stats.averageRating}
                      </div>
                      <div className="text-sm font-semibold text-[hsl(var(--text-gray-800))]">
                        Average Rating
                      </div>
                    </div>
                  )}
                  {bioData.heroSection.stats.yearsExperience && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[hsl(var(--primary))]">
                        {bioData.heroSection.stats.yearsExperience}
                      </div>
                      <div className="text-sm font-semibold text-[hsl(var(text-gray-800))]">
                        Years Experience
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
          <div className="relative max-w-lg mx-auto">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-80 h-96 bg-primary/90"
                style={{
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  transform: 'rotate(25deg) translate(-100px, 50px)',
                  zIndex: 1,
                }}
              />
              <div
                className="relative w-[500px] h-[400px] bg-accent/90 overflow-hidden"
                style={{
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  transform: 'rotate(-10deg)',
                  zIndex: 2,
                }}
              >
                {/* Hero image clipped by the yellow blob shape */}
                <Image
                  src="/HeroImage.png"
                  alt="Learn Arabic with Rose"
                  fill
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover object-center scale-110 translate-x-2"
                  priority
                />

                {/* Decorative dots over the image */}
                <div className="pointer-events-none absolute top-8 right-12 grid grid-cols-4 gap-2 z-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-foreground/70"
                    />
                  ))}
                </div>
                <div className="pointer-events-none absolute left-8 top-1/2 grid grid-cols-2 gap-2 z-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-foreground/70"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
