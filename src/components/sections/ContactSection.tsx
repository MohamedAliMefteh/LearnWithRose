"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Course } from "@/types/api";

export type ContactFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  interestedCourse: string;
  arabicLearningExperience: string;
  motivation: string;
  timeZone: string;
  genocideCondemnation: string;
  commitment: boolean;
  additionalMessage: string;
};

interface ContactSectionProps {
  courses: Course[];
  selectedCourse?: string;
  isModal?: boolean;
  onSubmitSuccess?: () => void;
}

export default function ContactSection({
  courses,
  selectedCourse,
  isModal = false,
  onSubmitSuccess,
}: ContactSectionProps) {
  const [formData, setFormData] = useState<ContactFormData>({
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

  const [localSelectedCourse, setLocalSelectedCourse] = useState<string>(selectedCourse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);

  // Keep local selection in sync with an optionally provided external selection
  useEffect(() => {
    if (selectedCourse) {
      setLocalSelectedCourse(String(selectedCourse));
      // Also update the form data
      setFormData(prev => ({ ...prev, interestedCourse: String(selectedCourse) }));
    }
  }, [selectedCourse]);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setSubmitStatus('idle');
            setSubmitMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if already submitting or in cooldown
    if (isSubmitting || cooldownTime > 0) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');
    
    try {
      const selectedCourseTitle = (() => {
        if (localSelectedCourse) {
          const found = courses.find((c) => String(c.id) === String(localSelectedCourse));
          return found?.title ?? String(localSelectedCourse);
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
        customQuestions: {
          motivation: formData.motivation,
          timeZone: formData.timeZone,
          genocideCondemnation: formData.genocideCondemnation,
          commitment: formData.commitment ? "true" : "false",
        },
      };

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage("🎉 Thank you for your inquiry! I will personally contact you within 24 hours to discuss your Arabic learning journey.");
        setCooldownTime(20); // 20 second cooldown
        
        // Reset form data
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
        setLocalSelectedCourse("");
        
        // Close modal if in modal mode
        if (isModal && onSubmitSuccess) {
          setTimeout(() => {
            onSubmitSuccess();
          }, 2000); // Wait 2 seconds to show success message before closing
        }
      } else {
        throw new Error("Failed to submit inquiry");
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitStatus('error');
      setSubmitMessage("❌ Sorry, there was an error submitting your inquiry. Please try again later or contact us directly.");
      setCooldownTime(20); // 20 second cooldown even on error to prevent spam
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conditional wrapper for modal vs section
  const Wrapper = isModal ? 'div' : 'section';
  
  return (
    <Wrapper
      {...(!isModal && { id: "contact" })}
      className={isModal ? "" : "py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-white via-accent/10 to-card/20 relative"}
    >
      {!isModal && (
        <div
          className="absolute top-0 left-0 w-full h-12 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent, hsl(var(--background))/60 80%)",
          }}
        />
      )}
      <div className={isModal ? "" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
        {!isModal && (
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--foreground))] mb-3 sm:mb-4">
              Start Your Arabic Journey
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))] px-4">
              Fill out the form below and I'll personally contact you within 24
              hours to discuss your learning goals and recommend the perfect
              course.
            </p>
          </div>
        )}

        <Card id="contact-form" className="border-primary">
          <CardHeader>
            <div className="mb-6 text-center">
              <div className="text-3xl mb-2">🌟 Welcome to Learn Arabic with Rose 🌟</div>
              <div className="text-lg text-[hsl(var(--foreground))] mb-2">
                Join our immersive Arabic courses designed to help you grow with confidence, joy, and cultural depth. Whether you’re starting fresh or building on what you know, our small-group, live classes give you the structure, support, and cultural connection you need to thrive.
              </div>
              <div className="text-lg text-primary font-semibold">
                ✨ A journey of language, culture, and community awaits you!
              </div>
            </div>
            <CardTitle className="text-2xl">Course Inquiry Form</CardTitle>
            <CardDescription>
              Tell me about your Arabic learning goals and I'll help you choose the right path.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status Message */}
            {submitStatus !== 'idle' && (
              <Alert className={`mb-6 ${
                submitStatus === 'success' 
                  ? 'border-green-200 bg-green-50 text-green-800' 
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {submitStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <AlertDescription className="text-sm font-medium">
                    {submitMessage}
                  </AlertDescription>
                </div>
                {cooldownTime > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                    <Clock className="h-4 w-4" />
                    <span>You can submit another inquiry in {cooldownTime} seconds</span>
                  </div>
                )}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Whatsapp number with your country code *</label>
                  <Input
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. +44 7123 456789"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interested Course</label>
                  <Select value={localSelectedCourse} onValueChange={setLocalSelectedCourse}>
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
                <label className="text-sm font-medium">What makes you want to learn Pal-Jor dialect? *</label>
                <Textarea
                  required
                  value={formData.motivation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Your answer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What is your time zone? *</label>
                <Select
                  required
                  value={formData.timeZone}
                  onValueChange={(value) => setFormData({ ...formData, timeZone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GMT-12">GMT-12:00 (International Date Line West)</SelectItem>
                    <SelectItem value="GMT-11">GMT-11:00 (Midway Island, Samoa)</SelectItem>
                    <SelectItem value="GMT-10">GMT-10:00 (Hawaii)</SelectItem>
                    <SelectItem value="GMT-9">GMT-09:00 (Alaska)</SelectItem>
                    <SelectItem value="GMT-8">GMT-08:00 (Pacific Time US & Canada)</SelectItem>
                    <SelectItem value="GMT-7">GMT-07:00 (Mountain Time US & Canada)</SelectItem>
                    <SelectItem value="GMT-6">GMT-06:00 (Central Time US & Canada)</SelectItem>
                    <SelectItem value="GMT-5">GMT-05:00 (Eastern Time US & Canada)</SelectItem>
                    <SelectItem value="GMT-4">GMT-04:00 (Atlantic Time Canada, Caracas)</SelectItem>
                    <SelectItem value="GMT-3">GMT-03:00 (Brazil, Buenos Aires)</SelectItem>
                    <SelectItem value="GMT-2">GMT-02:00 (Mid-Atlantic)</SelectItem>
                    <SelectItem value="GMT-1">GMT-01:00 (Azores, Cape Verde)</SelectItem>
                    <SelectItem value="GMT">GMT+00:00 (London, Lisbon, Casablanca)</SelectItem>
                    <SelectItem value="GMT+1">GMT+01:00 (Berlin, Paris, Rome, Madrid)</SelectItem>
                    <SelectItem value="GMT+2">GMT+02:00 (Cairo, Athens, Jerusalem, Istanbul)</SelectItem>
                    <SelectItem value="GMT+3">GMT+03:00 (Moscow, Baghdad, Nairobi)</SelectItem>
                    <SelectItem value="GMT+4">GMT+04:00 (Abu Dhabi, Dubai, Baku)</SelectItem>
                    <SelectItem value="GMT+5">GMT+05:00 (Islamabad, Karachi, Tashkent)</SelectItem>
                    <SelectItem value="GMT+6">GMT+06:00 (Almaty, Dhaka, Novosibirsk)</SelectItem>
                    <SelectItem value="GMT+7">GMT+07:00 (Bangkok, Jakarta, Hanoi)</SelectItem>
                    <SelectItem value="GMT+8">GMT+08:00 (Beijing, Hong Kong, Singapore)</SelectItem>
                    <SelectItem value="GMT+9">GMT+09:00 (Tokyo, Seoul, Osaka)</SelectItem>
                    <SelectItem value="GMT+10">GMT+10:00 (Sydney, Guam, Vladivostok)</SelectItem>
                    <SelectItem value="GMT+11">GMT+11:00 (Magadan, Solomon Islands)</SelectItem>
                    <SelectItem value="GMT+12">GMT+12:00 (Auckland, Fiji, Kamchatka)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Arabic Learning Experience */}
              <div className="space-y-2">
                <label className="text-sm font-medium">What is your Arabic level? (Pal-Jor dialect specifically) *</label>
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
                    <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                    <SelectItem value="some-basic">Some Basic Knowledge</SelectItem>
                    <SelectItem value="intermediate">Intermediate Level</SelectItem>
                    <SelectItem value="advanced">Advanced Speaker</SelectItem>
                    <SelectItem value="native">Native Speaker (Learning Dialects)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cultural Awareness */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Do you condemn Isre*l for committing a genocide in Gaza?</label>
                <Select
                  value={formData.genocideCondemnation}
                  onValueChange={(value) => setFormData({ ...formData, genocideCondemnation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="of-course-yes">of course, yes!</SelectItem>
                    <SelectItem value="neutral">I am more neutral</SelectItem>
                    <SelectItem value="no-right">No, they are doing okay, it has the right to self defense.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commitment Checkbox */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  By checking this box, I commit to joining Learn Arabic with Rose course for one full year of learning, growth, and cultural connection — and I’m ready to show up with consistency and heart.
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.commitment}
                    onChange={(e) => setFormData({ ...formData, commitment: e.target.checked })}
                    required
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <span>I commit to this journey.</span>
                </div>
              </div>

              {/* Additional Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Message</label>
                <Textarea
                  value={formData.additionalMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, additionalMessage: e.target.value })
                  }
                  placeholder="Tell me about your learning goals, timeline, or any specific questions..."
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={isSubmitting || cooldownTime > 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Inquiry...
                  </>
                ) : cooldownTime > 0 ? (
                  <>
                    <Clock className="mr-2 h-5 w-5" />
                    Wait {cooldownTime}s
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}
