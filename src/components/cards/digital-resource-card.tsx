"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, Video, File, Star, Download, ExternalLink } from "lucide-react";
import { DigitalResource } from "@/types/api";
import { convertByteDataToImageUrl, getFallbackImage } from "@/lib/image-utils";

interface DigitalResourceCardProps {
  resource: DigitalResource;
  onPurchase?: () => void;
}

function truncate(text: string, max: number) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

function FileTypeIcon({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();
  if (t.includes("pdf") || t.includes("doc") || t.includes("text")) {
    return <FileText className="h-5 w-5" />;
  }
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) {
    return <Headphones className="h-5 w-5" />;
  }
  if (t.includes("video") || t.includes("mp4") || t.includes("mov")) {
    return <Video className="h-5 w-5" />;
  }
  return <File className="h-5 w-5" />;
}

export function DigitalResourceCard({ resource, onPurchase }: DigitalResourceCardProps) {
  // Format price from amount field or use existing price field
  const priceLabel = resource.price?.trim() || (resource.amount > 0 ? `$${resource.amount}` : "Free");
  const [hovered, setHovered] = useState(false);
  const isFree = priceLabel === "Free" || resource.amount === 0;
  
  // Convert byte data thumbnail to displayable image URL
  const thumbnailUrl = convertByteDataToImageUrl(resource.thumbnail, getFallbackImage('library'));

  return (
    <Card
      className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Modern gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-[1px]">
        <div className="bg-white rounded-3xl h-full w-full" />
      </div>
      
      {/* Enhanced thumbnail with modern overlay */}
      <div className="relative z-10">
        <div
          className="relative h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group-hover:scale-105 transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Modern gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          
          {/* Floating price badge */}
          {priceLabel && (
            <div className="absolute top-4 right-4 z-20">
              <div className={`px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg border transition-all duration-300 ${
                isFree 
                  ? 'bg-green-500/90 text-white border-green-400/30' 
                  : 'bg-white/95 text-slate-900 border-white/40'
              }`}>
                <span className="text-sm font-bold">{priceLabel}</span>
              </div>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1.5">
              {resource.category || 'Digital Resource'}
            </Badge>
          </div>
          
          {/* Floating file type icon */}
          <div className="absolute bottom-4 right-4 z-20">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <div className="text-primary">
                <FileTypeIcon type={resource.fileType} />
              </div>
            </div>
          </div>
          
        </div>

        {/* Modern content section */}
        <div className="p-6">
          {/* Title and rating */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-slate-900 leading-tight flex-1 mr-3">
              {resource.title}
            </h3>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-slate-600">4.8</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {truncate(resource.description, 120)}
          </p>
          
          {/* Tags and level */}
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-slate-200 text-slate-600">
              {resource.fileType}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs border-primary/20 text-primary bg-primary/5">
              {resource.level || 'All Levels'}
            </Badge>
          </div>
          
          {/* Action button */}
          <Button
            onClick={onPurchase}
            className={`w-full rounded-2xl py-3 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              isFree
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white'
            }`}
            aria-label={`${isFree ? 'Download' : 'Purchase'} ${resource.title}`}
          >
            {isFree ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Free
              </>
            ) : (
              `Purchase for ${priceLabel}`
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
