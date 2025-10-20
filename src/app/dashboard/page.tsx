"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { CoursesManagement } from "@/components/dashboard/courses-management";
import { BioManagement } from "@/components/dashboard/bio-management";
import { DigitalResourcesManagement } from "@/components/dashboard/digital-resources-management";
import { ReviewsManagement } from "@/components/dashboard/reviews-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, Download, Star, Palette, Newspaper } from "lucide-react";
import { ColorManagement } from "@/components/dashboard/color-management";
import { BlogManagement } from "@/components/dashboard/blog-management";

type ActiveSection = "overview" | "bio" | "courses" | "resources" | "reviews" | "blog";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "bio":
        return <BioManagement />;
      case "courses":
        return <CoursesManagement />;
      case "resources":
        return <DigitalResourcesManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "blog":
        return <BlogManagement />;
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection("bio")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bio Information</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Profile</div>
                <p className="text-xs text-muted-foreground">
                  Manage your bio data
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection("courses")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">
                  Add, edit, and delete courses
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection("resources")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Library</div>
                <p className="text-xs text-muted-foreground">
                  Manage downloadable content
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection("reviews")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Testimonials</div>
                <p className="text-xs text-muted-foreground">
                  Manage student reviews
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection("blog")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blog</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage</div>
                <p className="text-xs text-muted-foreground">
                  Create, edit and delete blog posts
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Manage your website content and settings
                </p>
              </div>
              {activeSection !== "overview" && (
                <Button variant="outline" onClick={() => setActiveSection("overview")} className="w-full sm:w-auto">
                  Back to Overview
                </Button>
              )}
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
