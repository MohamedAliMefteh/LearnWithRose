"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Globe, Instagram, Youtube, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Learn Arabic with ROSE</span>
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
  );
}


