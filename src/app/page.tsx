"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { getBioData } from "@/lib/bio-data";




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
  additionalMessage: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, resourcesResponse, reviewsResponse, bioInfo] = await Promise.allSettled([
          coursesAPI.getAll(),
          fetch("/api/library-items"),
          fetch("/api/testimonials"),
          Promise.resolve(getBioData()),
        ]);

        // Handle courses data (with fallback already built into API)
        if (coursesData.status === 'fulfilled') {
          setCourses(coursesData.value);
        } else {
          console.error('Failed to load courses:', coursesData.reason);
          setCourses([]); // Empty array as fallback
        }

        // Handle digital resources from backend
        if (resourcesResponse.status === 'fulfilled') {
          const resourcesData = await resourcesResponse.value.json();
          setResources(Array.isArray(resourcesData) ? resourcesData : []);
        }
        if (reviewsResponse.status === 'fulfilled') {
          const reviewsData = await reviewsResponse.value.json();
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
        if (bioInfo.status === 'fulfilled') {
          setBioData(bioInfo.value);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to empty/default data
        setCourses([]);
        setResources(getDigitalResources());
        setReviews([]);
        setBioData(getBioData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCourseInquiry = (courseId: string | number) => {
    const course = courses.find(c => c.id === courseId);
    setModalCourse(course || null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const inquiryData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        interestedCourse: selectedCourse || formData.interestedCourse,
        arabicLearningExperience: formData.arabicLearningExperience,
        additionalMessage: formData.additionalMessage,
      };

  const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        alert("Thank you for your inquiry! I will contact you within 24 hours.");
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          interestedCourse: "",
          arabicLearningExperience: "",
          additionalMessage: "",
        });
        setSelectedCourse("");
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert("Sorry, there was an error submitting your inquiry. Please try again.");
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/10">
      {/* Navigation */}
  <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">
                Learn Arabic with ROSE
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("courses")}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Courses
              </button>
              <button
                onClick={() => scrollToSection("resources")}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Contact
              </button>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="w-fit bg-[hsl(var(--secondary-yellow))]/20 text-[hsl(var(--secondary-yellow))] hover:bg-[hsl(var(--secondary-yellow))]/40">
                  Native Arabic Speaker & Cultural Expert
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Master Authentic
                  <span className="text-primary block">
                    Palestinian & Lebanese
                  </span>
                  Arabic Accents
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Learn from a native speaker with 8+ years of teaching
                  experience. Discover the beauty and cultural richness of
                  Palestinian and Lebanese dialects through personalized courses
                  and authentic materials.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--secondary-yellow))]">{bioData?.totalStudents || 500}+</div>
                  <div className="text-sm text-gray-600">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--secondary-yellow))]">{bioData?.averageRating || 4.9}★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--secondary-yellow))]">{bioData?.yearsExperience || 8}+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative max-w-lg mx-auto">
              {/* Rose's name */}
              <div className="absolute -top-16 -left-16 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-primary/20">
                <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-3xl font-bold">
                  {bioData?.name || "ROSE"}
                </div>
              </div>

              {/* 8+ Years badge */}
              <div className="absolute -top-8 -right-8 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-primary/20">
                <div className="text-center">
                  <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-sm font-semibold text-gray-700">
                    {bioData?.yearsExperience || 8}+ Years
                  </div>
                </div>
              </div>

              {/* Native & Cultural Speaker badge */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-primary/20">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-700">
                    {bioData?.title || "Native & Cultural Speaker"}
                  </div>
                </div>
              </div>

              {/* Dotted arrow with two turns from image to name */}
              <svg
                className="absolute -top-8 -left-8 w-32 h-32 pointer-events-none"
                viewBox="0 0 128 128"
              >
                {/* First segment: from image center going up */}
                <line
                  x1="64"
                  y1="64"
                  x2="64"
                  y2="32"
                  stroke="rgb(232, 79, 48)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                {/* Second segment: horizontal turn */}
                <line
                  x1="64"
                  y1="32"
                  x2="32"
                  y2="32"
                  stroke="rgb(232, 79, 48)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                {/* Third segment: vertical to name */}
                <line
                  x1="32"
                  y1="32"
                  x2="32"
                  y2="16"
                  stroke="rgb(232, 79, 48)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                {/* Arrow head */}
                <polygon
                  points="28,16 36,16 32,8"
                  fill="rgb(232, 79, 48)"
                  opacity="0.7"
                />
              </svg>

              {/* Main image container - placeholder */}
              <div className="w-64 h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 rounded-full p-4 relative overflow-hidden shadow-xl mx-auto">
                {/* Placeholder content */}
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm font-medium">Profile Photo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Your Teacher
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {bioData?.description || "Born and raised in Palestine, with deep connections to Lebanese culture, I bring authentic language knowledge and cultural insights to every lesson."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-orange-200">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Certified Educator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {bioData?.experience || "MA in Arabic Linguistics with specialized training in dialect instruction and cultural immersion techniques."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Cultural Ambassador</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Native speaker sharing the rich traditions, history, and
                  cultural nuances of Palestinian and Lebanese communities.
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Personalized Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every student receives customized lessons tailored to their
                  goals, learning style, and cultural interests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section
        id="courses"
  className="py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Arabic Accent Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully crafted courses designed to help you
              master authentic Palestinian and Lebanese Arabic pronunciation and
              conversation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onInquiry={handleCourseInquiry}
              />
            ))}
            {/* Course Details Modal */}
            <CourseDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} course={modalCourse} />
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Digital Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complement your learning with our curated collection of PDFs,
              audio guides, and reference materials for Palestinian and Lebanese
              Arabic.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <DigitalResourceCard
                key={index}
                resource={resource}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from learners who have transformed their Arabic pronunciation
              and cultural understanding.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section
        id="contact"
  className="py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Arabic Journey
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and I'll personally contact you within 24
              hours to discuss your learning goals and recommend the perfect
              course.
            </p>
          </div>

          <Card id="contact-form" className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-2xl">Course Inquiry Form</CardTitle>
              <CardDescription>
                Tell me about your Arabic learning goals and I'll help you
                choose the right path.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      placeholder="Your phone number"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Arabic Learning Experience
                  </label>
                  <Select
                    value={formData.arabicLearningExperience}
                    onValueChange={(value) =>
                      setFormData({ ...formData, arabicLearningExperience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Message
                  </label>
                  <Textarea
                    value={formData.additionalMessage}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalMessage: e.target.value })
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
      <footer className="bg-gray-900 text-white py-12">
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
                Authentic Palestinian and Lebanese Arabic instruction with
                cultural immersion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Courses</h3>
              <div className="space-y-2 text-gray-400">
                <div>Palestinian Accent</div>
                <div>Lebanese Accent</div>
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
                <Instagram className="h-6 w-6 text-gray-400 hover:text-primary cursor-pointer" />
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
