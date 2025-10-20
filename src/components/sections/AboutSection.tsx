"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Users, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BioData } from "@/types/api";

interface AboutSectionProps {
  bioData: BioData | null;
  loading: boolean;
}

export default function AboutSection({ bioData, loading }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-white via-accent/10 to-card/20 relative"
    >
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
            Meet <span className="text-primary">Rose</span>, Your Teacher
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch group">
          {loading ? (
            <>
              <Card className="border-primary">
                <CardHeader>
                  <Skeleton className="h-12 w-12 mb-4" />
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <Skeleton className="h-12 w-12 mb-4" />
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <Skeleton className="h-12 w-12 mb-4" />
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </>
          ) : (
            bioData?.meetYourTeacher?.map((item, index) => {
              const icons = [Award, Users, BookOpen];
              const IconComponent = icons[index % icons.length];
              return (
                <Card
                  key={index}
                  className="border-primary h-full flex flex-col transform-gpu transition-all duration-300 group-hover:[&:not(:hover)]:blur-[1.5px] hover:blur-0 hover:scale-[1.03] hover:shadow-xl hover:z-10"
                >
                  <CardHeader>
                    <IconComponent className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="prose prose-sm text-[hsl(var(--foreground))]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
