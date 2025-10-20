"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-white overflow-hidden border-t border-gray-200">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image 
                  src="/altlogo.png" 
                  alt="ROSE Logo" 
                  width={56} 
                  height={56} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Learn Arabic with Rose
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md">
              💛 Learn the <span className="font-semibold text-primary">#JordanianDialect</span> and the <span className="font-semibold text-primary">#PalestinianDialect</span> in a fun, creative, interactive, and effective method with your favorite teacher, Rose. 😌
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for Arabic learners worldwide</span>
            </div>
          </div>

          {/* Connect Section */}
          <div className="space-y-6 md:text-right">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Connect With Us</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Follow our journey and stay updated with the latest content
              </p>
              <div className="flex space-x-4 md:justify-end">
                <a 
                  href="https://www.instagram.com/arabicteacherrose/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                </a>
                <a 
                  href="mailto:learn.with.rose.pr@gmail.com" 
                  className="group relative w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
                  aria-label="Email us at learn.with.rose.pr@gmail.com"
                >
                  <Mail className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-400">
              ✨
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Learn Arabic with Rose. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-500 transition-colors text-xs">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


