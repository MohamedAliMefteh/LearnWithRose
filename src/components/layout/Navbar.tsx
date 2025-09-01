"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

export interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
}

export default function Navbar({ scrollToSection }: NavbarProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/altlogo.png" alt="ROSE Logo" width={56} height={56} className="h-14 w-14" />
            <span className="text-xl sm:text-2xl font-bold text-primary">
              Learn Arabic with Rose
            </span>
          </Link>
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
  );
}
