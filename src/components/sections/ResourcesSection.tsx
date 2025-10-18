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
           Resources
          </h2>
          <p className="text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto">
            Your #1 resource of Palestinian Jordanian Arabic. Complement your learning journey with our curated ebooks, booklets, short stories and flashcards.
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
                  // Store item data securely in session storage
                  const checkoutData = {
                    id: resource.id,
                    title: resource.title,
                    description: resource.description,
                    fileType: resource.fileType,
                    category: resource.category,
                    level: resource.level,
                    amount: resource.amount || 0,
                    price: resource.price,
                    thumbnail: resource.thumbnail,
                    timestamp: Date.now() // For security - expire old data
                  };
                  
                  // Store in session storage (more secure than URL)
                  sessionStorage.setItem('checkout-item', JSON.stringify(checkoutData));
                  
                  // Navigate to checkout with just the item ID
                  router.push(`/checkout?id=${resource.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
