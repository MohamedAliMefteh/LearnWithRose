"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DigitalResource } from "@/types/api";
import { DigitalResourceCard } from "@/components/cards/digital-resource-card";

export interface ResourcesSectionProps {
  loading: boolean;
  resources: DigitalResource[];
}

export default function ResourcesSection({ loading, resources }: ResourcesSectionProps) {
  const router = useRouter();
  if (!loading && resources.length === 0) return null;

  return (
    <section
      id="resources"
      className="py-20 bg-gradient-to-br from-white via-accent/10 to-card/20 relative"
    >
      <div
        className="absolute top-0 left-0 w-full h-12 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(var(--background))/60 80%)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Digital Resources
          </h2>
          <p className="text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto">
            Complement your learning with our curated collection of PDFs, audio guides, and
            reference materials for Palestinian and Jordanian Arabic.
          </p>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <DigitalResourceCard
                key={index}
                resource={resource}
                onPurchase={() => {
                  const params = new URLSearchParams({
                    id: String(resource.id),
                    min: resource.price ? resource.price.replace(/[^0-9.]/g, "") : "0.01",
                    name: resource.title || "Digital Resource",
                    type: resource.fileType || "document",
                  });
                  router.push(`/checkout?${params.toString()}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
