"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DigitalResource } from "@/types/api";
import { DigitalResourceCard } from "@/components/cards/digital-resource-card";
import { ResourceDetailsModal } from "@/components/cards/resource-details-modal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface ResourcesSectionProps {
  loading: boolean;
  resources: DigitalResource[];
}

const ITEMS_PER_PAGE = 6;

export default function ResourcesSection({ loading, resources }: ResourcesSectionProps) {
  const router = useRouter();
  const [selectedResource, setSelectedResource] = useState<DigitalResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleViewDetails = (resource: DigitalResource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handlePurchase = (resource: DigitalResource) => {
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
    
    // Close modal if open
    setIsModalOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResources = resources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!loading && resources.length === 0) return null;

  return (
    <section
      id="resources"
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
           Resources
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto px-4">
            Your #1 resource of Palestinian Jordanian Arabic. Complement your learning journey with our curated ebooks, booklets, short stories and flashcards.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {paginatedResources.map((resource, index) => (
                <DigitalResourceCard
                  key={index}
                  resource={resource}
                  onViewDetails={() => handleViewDetails(resource)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resource Details Modal */}
      <ResourceDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resource={selectedResource}
        onPurchase={handlePurchase}
      />
    </section>
  );
}
