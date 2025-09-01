"use client";

import { useState, useEffect } from "react";
import CoursesSection from "@/components/sections/CoursesSection";
import ResourcesSection from "@/components/sections/ResourcesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";
import { Course, DigitalResource, Review, BioData } from "@/types/api";
import { coursesAPI } from "@/lib/courses-api";
import { bioAPI } from "@/lib/bio-api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import AddReviewSection from "@/components/sections/AddReviewSection";

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    courses: true,
    resources: true,
    reviews: true,
    bio: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, resourcesResponse, reviewsResponse, bioInfo] =
          await Promise.allSettled([
            coursesAPI.getAll(),
            fetch("/api/library-items"),
            fetch("/api/testimonials"),
            bioAPI.get(),
          ]);

        // Handle courses data (with fallback already built into API)
        if (coursesData.status === "fulfilled") {
          setCourses(coursesData.value);
        } else {
          console.error("Failed to load courses:", coursesData.reason);
          setCourses([]); // Empty array as fallback
        }
        setLoadingStates((prev) => ({ ...prev, courses: false }));

        // Handle digital resources from backend
        if (resourcesResponse.status === "fulfilled") {
          const resourcesData = await resourcesResponse.value.json();
          setResources(Array.isArray(resourcesData) ? resourcesData : []);
        }
        setLoadingStates((prev) => ({ ...prev, resources: false }));

        if (reviewsResponse.status === "fulfilled") {
          const reviewsData = await reviewsResponse.value.json();
          const onlyApproved = Array.isArray(reviewsData) ? reviewsData.filter((r: any) => r?.approved === true) : [];
          setReviews(onlyApproved);
        }
        setLoadingStates((prev) => ({ ...prev, reviews: false }));

        if (bioInfo.status === "fulfilled") {
          setBioData(bioInfo.value);
        }
        setLoadingStates((prev) => ({ ...prev, bio: false }));
      } catch (error) {
        console.error("Failed to load data:", error);
        // Fallback to empty/default data
        setCourses([]);
        setResources([]);
        setReviews([]);
        setBioData(null);
        setLoadingStates({
          courses: false,
          resources: false,
          reviews: false,
          bio: false,
        });
      }
    };

    fetchData();
  }, []);

  const handleEnroll = (course?: Course | null) => {
    if (course) {
      setSelectedCourse(String(course.id));
    }
    // Scroll after closing to ensure smooth UX
    setTimeout(() => {
      const el = document.getElementById("contact-form");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };


  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={"min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10"}
    >
      {/* Navigation */}
      <Navbar scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <HeroSection bioData={bioData} loading={loadingStates.bio} scrollToSection={scrollToSection} />

      {/* About Section */}
      <AboutSection bioData={bioData} loading={loadingStates.bio} />

      {/* Courses Section */}
      <CoursesSection
        loading={loadingStates.courses}
        courses={courses}
        onEnroll={handleEnroll}
      />

      {/* Resources Section */}
      <ResourcesSection loading={loadingStates.resources} resources={resources} />

      {/* Testimonials Section */}
      <TestimonialsSection loading={loadingStates.reviews} reviews={reviews} />

      {/* Contact Form */}
      <ContactSection
        courses={courses}
        selectedCourse={selectedCourse}
      />

      {/* Add Review Section */}
      <AddReviewSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}


