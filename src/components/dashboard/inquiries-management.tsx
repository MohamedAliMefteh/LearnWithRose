"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries?page=0&size=10");
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      const data = await res.json();
      // The API returns { content: [...] }
      setInquiries(Array.isArray(data.content) ? data.content : []);
    } catch (error) {
      toast.error("Could not load inquiries");
      setInquiries([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inquiries Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No inquiries found.</div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
