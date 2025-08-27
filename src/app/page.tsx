"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Play,
  Download,
  Users,
  Clock,
  Award,
  MessageCircle,
  Mail,
  Instagram,
  Youtube,
  BookOpen,
  Globe,
  Heart,
} from "lucide-react";
import { CourseCard } from "@/components/cards/course-card";
import { CourseDetailsModal } from "@/components/cards/course-details-modal";
import { DigitalResourceCard } from "@/components/cards/digital-resource-card";
import { ReviewCard } from "@/components/cards/review-card";
import { Course, DigitalResource, Review, BioData } from "@/types/api";
import { coursesAPI } from "@/lib/courses-api";
import { getDigitalResources } from "@/lib/digital-resources-data";
import { getReviews } from "@/lib/reviews-data";
import { bioAPI } from "@/lib/bio-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    interestedCourse: "",
    arabicLearningExperience: "",
    motivation: "",
    timeZone: "",
    genocideCondemnation: "of-course-yes",
    commitment: false,
    additionalMessage: "",
  });
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
  const [isDark, setIsDark] = useState(false);

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
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
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

  const handleCourseInquiry = (courseId: string | number) => {
    const course = courses.find((c) => c.id === courseId);
    setModalCourse(course || null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Derive the selected course title (prefer a human-friendly name). Fallback to stored interestedCourse if any.
      const selectedCourseTitle = (() => {
        if (selectedCourse) {
          const found = courses.find((c) => String(c.id) === String(selectedCourse));
          return found?.title ?? String(selectedCourse);
        }
        return formData.interestedCourse || "";
      })();

      const inquiryData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        interestedCourse: selectedCourseTitle,
        arabicLearningExperience: formData.arabicLearningExperience,
        additionalMessage: formData.additionalMessage,
        // Send extra form answers as a flexible map so backend can capture them
        customQuestions: {
          motivation: formData.motivation,
          timeZone: formData.timeZone,
          genocideCondemnation: formData.genocideCondemnation,
          commitment: formData.commitment? "true":"false",
        },
      };

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        alert(
          "Thank you for your inquiry! I will contact you within 24 hours.",
        );
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          interestedCourse: "",
          arabicLearningExperience: "",
          motivation: "",
          timeZone: "",
          genocideCondemnation: "of-course-yes",
          commitment: false,
          additionalMessage: "",
        });
        setSelectedCourse("");
      } else {
        throw new Error("Failed to submit inquiry");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert(
        "Sorry, there was an error submitting your inquiry. Please try again.",
      );
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10${isDark ? " dark" : ""}`}
    >
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ROSE Logo" width={56} height={56} className="h-14 w-14" />
              <span className="text-xl sm:text-2xl font-bold text-primary">
                Learn Arabic with ROSE
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-800 hover:text-primary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("courses")}
                className="text-gray-800 hover:text-primary transition-colors"
              >
                Courses
              </button>
              <button
                onClick={() => scrollToSection("resources")}
                className="text-gray-800 hover:text-primary transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-800 hover:text-primary transition-colors"
              >
                Contact
              </button>
              <Link
                href="/blog"
                className="text-gray-800 hover:text-primary transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-800 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                {loadingStates.bio ? (
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
                          {bioData.heroSection.tag}
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
              {loadingStates.bio ? (
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

      {/* About Section */}
      <section
        id="about"
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
              Meet <span className="text-primary">Rose</span>, Your Teacher
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch group">
            {loadingStates.bio ? (
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
                  <Card key={index} className="border-primary h-full flex flex-col transform-gpu transition-all duration-300 group-hover:[&:not(:hover)]:blur-[1.5px] hover:blur-0 hover:scale-[1.03] hover:shadow-xl hover:z-10">
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

      {/* Courses Section */}
      <section
        id="courses"
        className="py-20 bg-gradient-to-br from-secondary/10 via-card/10 to-background/20 relative"
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
              Arabic Dialect Courses
            </h2>
            <p className="text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto">
              Choose from our carefully crafted courses designed to help you
              master Palestinian-Jordanian Dialects.
            </p>
          </div>
          {loadingStates.courses ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <div className="h-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onInquiry={handleCourseInquiry}
                />
              ))}
              {/* Course Details Modal */}
              <CourseDetailsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                course={modalCourse}
                onEnroll={(course) => {
                  if (course) {
                    setSelectedCourse(String(course.id));
                  }
                  setModalOpen(false);
                  // Scroll after closing to ensure smooth UX
                  setTimeout(() => {
                    const el = document.getElementById("contact-form");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Resources Section */}
      {(loadingStates.resources || resources.length > 0) && (
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
                Complement your learning with our curated collection of PDFs,
                audio guides, and reference materials for Palestinian and
                Jordanian Arabic.
              </p>
            </div>
            {loadingStates.resources ? (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {resources.map((resource, index) => (
                  <DigitalResourceCard key={index} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {(loadingStates.reviews || reviews.length > 0) && (
        <section className="py-20 bg-gradient-to-br from-secondary/10 via-card/10 to-background/20 relative">
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
                What Students Say
              </h2>
              <p className="text-xl text-[hsl(var(--foreground))] max-w-3xl mx-auto">
                Hear from learners who have transformed their Arabic pronunciation
                and cultural understanding.
              </p>
            </div>
            {loadingStates.reviews ? (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Add Review Section */}
      <section className="py-16 bg-gradient-to-br from-white via-accent/5 to-card/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>Share your experience and help others choose the right course.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddReviewForm onSubmitted={(newReview) => setReviews((prev) => [newReview, ...prev])} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-br from-white via-accent/10 to-card/20 relative"
      >
        <div
          className="absolute top-0 left-0 w-full h-12 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent, hsl(var(--background))/60 80%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
              Start Your Arabic Journey
            </h2>
            <p className="text-xl text-[hsl(var(--foreground))]">
              Fill out the form below and I'll personally contact you within 24
              hours to discuss your learning goals and recommend the perfect
              course.
            </p>
          </div>

          <Card id="contact-form" className="border-primary">
            <CardHeader>
              <div className="mb-6 text-center">
                <div className="text-3xl mb-2">
                  🌟 Welcome to Learn Arabic with Rose 🌟
                </div>
                <div className="text-lg text-[hsl(var(--foreground))] mb-2">
                  Join our immersive Arabic courses designed to help you grow
                  with confidence, joy, and cultural depth. Whether you’re
                  starting fresh or building on what you know, our small-group,
                  live classes give you the structure, support, and cultural
                  connection you need to thrive.
                </div>
                <div className="text-lg text-primary font-semibold">
                  ✨ A journey of language, culture, and community awaits you!
                </div>
              </div>
              <CardTitle className="text-2xl">Course Inquiry Form</CardTitle>
              <CardDescription>
                Tell me about your Arabic learning goals and I'll help you
                choose the right path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Whatsapp number with your country code *
                    </label>
                    <Input
                      required
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. +44 7123 456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Interested Course
                    </label>
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Motivation & Commitment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    What makes you want to learn Pal-Jor dialect? *
                  </label>
                  <Textarea
                    required
                    value={formData.motivation}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, motivation: e.target.value })
                    }
                    placeholder="Your answer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    What is your time zone? *
                  </label>
                  <Select
                    required
                    value={formData.timeZone}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timeZone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT-12">
                        GMT-12:00 (International Date Line West)
                      </SelectItem>
                      <SelectItem value="GMT-11">
                        GMT-11:00 (Midway Island, Samoa)
                      </SelectItem>
                      <SelectItem value="GMT-10">GMT-10:00 (Hawaii)</SelectItem>
                      <SelectItem value="GMT-9">GMT-09:00 (Alaska)</SelectItem>
                      <SelectItem value="GMT-8">
                        GMT-08:00 (Pacific Time US & Canada)
                      </SelectItem>
                      <SelectItem value="GMT-7">
                        GMT-07:00 (Mountain Time US & Canada)
                      </SelectItem>
                      <SelectItem value="GMT-6">
                        GMT-06:00 (Central Time US & Canada)
                      </SelectItem>
                      <SelectItem value="GMT-5">
                        GMT-05:00 (Eastern Time US & Canada)
                      </SelectItem>
                      <SelectItem value="GMT-4">
                        GMT-04:00 (Atlantic Time Canada, Caracas)
                      </SelectItem>
                      <SelectItem value="GMT-3">
                        GMT-03:00 (Brazil, Buenos Aires)
                      </SelectItem>
                      <SelectItem value="GMT-2">
                        GMT-02:00 (Mid-Atlantic)
                      </SelectItem>
                      <SelectItem value="GMT-1">
                        GMT-01:00 (Azores, Cape Verde)
                      </SelectItem>
                      <SelectItem value="GMT">
                        GMT+00:00 (London, Lisbon, Casablanca)
                      </SelectItem>
                      <SelectItem value="GMT+1">
                        GMT+01:00 (Berlin, Paris, Rome, Madrid)
                      </SelectItem>
                      <SelectItem value="GMT+2">
                        GMT+02:00 (Cairo, Athens, Jerusalem, Istanbul)
                      </SelectItem>
                      <SelectItem value="GMT+3">
                        GMT+03:00 (Moscow, Baghdad, Nairobi)
                      </SelectItem>
                      <SelectItem value="GMT+4">
                        GMT+04:00 (Abu Dhabi, Dubai, Baku)
                      </SelectItem>
                      <SelectItem value="GMT+5">
                        GMT+05:00 (Islamabad, Karachi, Tashkent)
                      </SelectItem>
                      <SelectItem value="GMT+6">
                        GMT+06:00 (Almaty, Dhaka, Novosibirsk)
                      </SelectItem>
                      <SelectItem value="GMT+7">
                        GMT+07:00 (Bangkok, Jakarta, Hanoi)
                      </SelectItem>
                      <SelectItem value="GMT+8">
                        GMT+08:00 (Beijing, Hong Kong, Singapore)
                      </SelectItem>
                      <SelectItem value="GMT+9">
                        GMT+09:00 (Tokyo, Seoul, Osaka)
                      </SelectItem>
                      <SelectItem value="GMT+10">
                        GMT+10:00 (Sydney, Guam, Vladivostok)
                      </SelectItem>
                      <SelectItem value="GMT+11">
                        GMT+11:00 (Magadan, Solomon Islands)
                      </SelectItem>
                      <SelectItem value="GMT+12">
                        GMT+12:00 (Auckland, Fiji, Kamchatka)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Arabic Learning Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    What is your Arabic level? (Pal-Jor dialect specifically) *
                  </label>
                  <Select
                    required
                    value={formData.arabicLearningExperience}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        arabicLearningExperience: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete-beginner">
                        Complete Beginner
                      </SelectItem>
                      <SelectItem value="some-basic">
                        Some Basic Knowledge
                      </SelectItem>
                      <SelectItem value="intermediate">
                        Intermediate Level
                      </SelectItem>
                      <SelectItem value="advanced">Advanced Speaker</SelectItem>
                      <SelectItem value="native">
                        Native Speaker (Learning Dialects)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cultural Awareness */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Do you condemn Isre*l for committing a genocide in Gaza?
                  </label>
                  <Select
                    value={formData.genocideCondemnation}
                    onValueChange={(value) =>
                      setFormData({ ...formData, genocideCondemnation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="of-course-yes">
                        of course, yes!
                      </SelectItem>
                      <SelectItem value="neutral">I am more neutral</SelectItem>
                      <SelectItem value="no-right">
                        No, they are doing okay, it has the right to self
                        defense.
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Commitment Checkbox */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    By checking this box, I commit to joining Learn Arabic with
                    Rose course for one full year of learning, growth, and
                    cultural connection — and I’m ready to show up with
                    consistency and heart.
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.commitment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commitment: e.target.checked,
                        })
                      }
                      required
                      className="h-4 w-4 border-gray-300 rounded"
                    />
                    <span>I commit to this journey.</span>
                  </div>
                </div>

                {/* Additional Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Message
                  </label>
                  <Textarea
                    value={formData.additionalMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({
                        ...formData,
                        additionalMessage: e.target.value,
                      })
                    }
                    placeholder="Tell me about your learning goals, timeline, or any specific questions..."
                    rows={4}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">
                  Learn Arabic with ROSE
                </span>
              </div>
              <p className="text-gray-400">
                Authentic Palestinian and Joradanian Arabic instruction with
                cultural immersion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Courses</h3>
              <div className="space-y-2 text-gray-400">
                <div>Palestinian Accent</div>
                <div>Jordanian Accent</div>
                <div>Business Arabic</div>
                <div>Cultural Immersion</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-gray-400">
                <div>Pronunciation Guides</div>
                <div>Cultural Materials</div>
                <div>Audio Collections</div>
                <div>Practice Exercises</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer"  />
                <Youtube className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
                <Mail className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Learn Arabic with Rose. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


// Lightweight inline form to add a testimonial under the reviews section
function AddReviewForm({ onSubmitted }: { onSubmitted: (newReview: Review) => void }) {
  const [form, setForm] = useState({
    name: "",
    accent: "",
    courseName: "",
    rating: 5 as number,
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!form.content.trim()) {
      setError("Please write your review.");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { id: 0, ...form } as any;
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      let created: any = null;
      try {
        created = await res.json();
      } catch {}

      const newReview: Review = {
        id: created?.id ?? Date.now(),
        name: created?.name ?? form.name,
        accent: created?.accent ?? form.accent,
        content: created?.content ?? form.content,
        rating: created?.rating ?? form.rating,
        profileImage: created?.profileImage ?? "",
        courseName: created?.courseName ?? form.courseName,
      };

      onSubmitted(newReview);
      setSuccess("Thank you! Your review has been submitted.");
      setForm({ name: "", accent: "", courseName: "", rating: 5, content: "" });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Accent (e.g., Palestinian, Jordanian)"
          value={form.accent}
          onChange={(e) => setForm({ ...form, accent: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Course Name (optional)"
          value={form.courseName}
          onChange={(e) => setForm({ ...form, courseName: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Rating</label>
          <Input
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-28"
          />
        </div>
      </div>
      <Textarea
        placeholder="Write your review..."
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="min-h-28"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="min-w-36">
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
