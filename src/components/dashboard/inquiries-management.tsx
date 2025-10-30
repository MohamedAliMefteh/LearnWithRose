"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export type Inquiry = {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  interestedCourse?: string;
  arabicLearningExperience?: string;
  additionalMessage?: string;
  customQuestions?: Record<string, any> | null;
  createdAt?: string;
};

export function InquiriesManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchInquiries();
  }, [currentPage]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inquiries?page=${currentPage}&size=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      const data = await res.json();
      // Spring Pageable returns { content: [...], totalPages, totalElements }
      setInquiries(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error("Could not load inquiries");
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Inquiries Management</CardTitle>
          <div className="text-sm text-gray-500">
            Total: {totalElements} inquiries
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, course, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No inquiries found.</div>
        ) : (
          <>
            <div className="space-y-6">
              {inquiries.map((inq) => (
                <div key={inq.id} className="border rounded-lg p-4 bg-white shadow-sm break-words">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <div className="font-semibold text-lg">{inq.fullName}</div>
                      <div className="text-sm text-gray-500">{inq.email}</div>
                      {inq.phoneNumber && <div className="text-sm text-gray-500">{inq.phoneNumber}</div>}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {inq.interestedCourse && <Badge>{inq.interestedCourse}</Badge>}
                      {inq.arabicLearningExperience && <Badge variant="secondary">{inq.arabicLearningExperience}</Badge>}
                    </div>
                  </div>

                  {inq.additionalMessage && (
                    <div className="mt-2 text-gray-700 text-sm">
                      <span className="font-medium">Message:</span> {inq.additionalMessage}
                    </div>
                  )}

                  {inq.customQuestions && typeof inq.customQuestions === "object" && Object.keys(inq.customQuestions || {}).length > 0 && (
                    <div className="mt-3 text-sm text-gray-700">
                      <div className="space-y-1">
                        {Object.entries(inq.customQuestions as Record<string, any>).map(([k, v]) => (
                          <div key={k} className="flex flex-col md:flex-row md:items-start md:gap-2">
                            <span className="text-gray-500 capitalize">{k.replace(/[-_]/g, " ")}{":"}</span>
                            <span className="text-gray-800 break-words">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inq.createdAt && (
                    <div className="mt-2 text-xs text-gray-400">Submitted: {new Date(inq.createdAt).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
