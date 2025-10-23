"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NavbarProps {
  scrollToSection: (sectionId: string) => void;
}

export default function Navbar({ scrollToSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/altlogo.png" alt="ROSE Logo" width={56} height={56} className="h-12 w-12 sm:h-14 sm:w-14" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate max-w-[180px] sm:max-w-none">
              Learn Arabic with Rose
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-800 hover:text-primary transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("courses")}
              className="text-gray-800 hover:text-primary transition-colors font-medium"
            >
              Courses
            </button>
            <button
              onClick={() => scrollToSection("resources")}
              className="text-gray-800 hover:text-primary transition-colors font-medium"
            >
              Resources
            </button>
            <Link
              href="/blog"
              className="text-gray-800 hover:text-primary transition-colors font-medium"
            >
              Blog
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/60 mt-2 pt-4 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => handleNavClick("about")}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick("courses")}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Courses
            </button>
            <button
              onClick={() => handleNavClick("resources")}
              className="block w-full text-left px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
            >
              Resources
            </button>
            <Link
              href="/blog"
              className="block px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
