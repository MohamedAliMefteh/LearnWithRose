"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, Video, File } from "lucide-react";
import { DigitalResource } from "@/types/api";

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
    return <FileText className="h-7 w-7" />;
  }
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) {
    return <Headphones className="h-7 w-7" />;
  }
  if (t.includes("video") || t.includes("mp4") || t.includes("mov")) {
    return <Video className="h-7 w-7" />;
  }
  return <File className="h-7 w-7" />;
}

export function DigitalResourceCard({ resource, onPurchase }: DigitalResourceCardProps) {
  const priceLabel = resource.price?.trim() || "Free";
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Card
        className="group relative overflow-visible rounded-2xl border border-muted/30 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header with thumbnail background (falls back to placeholder) */}
        <div
          className="relative h-24 w-full rounded-t-2xl bg-muted/40 overflow-hidden"
          style={{
            backgroundImage: `url(${resource.thumbnail || "/placeholdercourse.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
          {/* Circular icon badge overlapping header and body - initially half visible */}
          <div
            aria-hidden="true"
            className={`file-badge absolute left-1/2 top-full z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white will-change-transform ${hovered ? "animate" : ""}`}
          >
            <div className="text-amber-500">
              <FileTypeIcon type={resource.fileType} />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-9 text-center">
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {resource.title}
          </h3>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {resource.fileType}
            </Badge>
            {priceLabel && (
              <span className="text-xs font-medium text-muted-foreground">{priceLabel}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {truncate(resource.description, 110)}
          </p>

          <CardContent className="p-0 mt-5">
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={onPurchase}
                className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-5 text-base text-white shadow hover:from-amber-500/90 hover:to-orange-500/90"
                aria-label={`Buy ${resource.title}`}
              >
                Buy
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <style jsx>{`
        @keyframes peekBounce {
          0% { transform: translate(-50%, -50%); }
          45% { transform: translate(-50%, -115%); }
          100% { transform: translate(-50%, -80%); }
        }
        .file-badge.animate {
          animation: peekBounce 700ms ease-in-out forwards;
        }
      `}</style>
    </>
  );
}
