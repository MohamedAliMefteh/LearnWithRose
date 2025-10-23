import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Headphones, Video, File, BookOpen } from "lucide-react";
import { DigitalResource } from "@/types/api";
import { convertByteDataToImageUrl, getFallbackImage } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResourceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  resource: DigitalResource | null;
  onPurchase?: (resource: DigitalResource) => void;
}

function FileTypeIcon({ type }: { type?: string }) {
  const t = (type || "").toLowerCase();
  if (t.includes("pdf") || t.includes("doc") || t.includes("text")) {
    return <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />;
  }
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) {
    return <Headphones className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />;
  }
  if (t.includes("video") || t.includes("mp4") || t.includes("mov")) {
    return <Video className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />;
  }
  return <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />;
}

export function ResourceDetailsModal({ open, onClose, resource, onPurchase }: ResourceDetailsModalProps) {
  if (!resource) return null;

  const thumbnailUrl = convertByteDataToImageUrl(resource.thumbnail, getFallbackImage('library'));
  const isFree = resource.amount === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] p-0 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-primary/10 flex flex-col">
        {/* Compact Header with Title, Image, and Tags */}
        <div className="relative isolate p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white via-accent/10 to-secondary/10 border-b border-primary/10">
          <div className="absolute -top-16 -right-16 size-40 sm:size-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-40 sm:size-56 rounded-full bg-accent/10 blur-3xl" />

          <div className="flex items-start gap-3 sm:gap-4">
            {/* Document Icon */}
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-white/80 border-2 border-primary/20 shadow-lg flex items-center justify-center">
              <div className="text-primary">
                <FileTypeIcon type={resource.fileType} />
              </div>
            </div>

            {/* Title and Tags */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-primary leading-tight whitespace-normal break-words mb-2 sm:mb-3">
                {resource.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary" className="capitalize text-xs">{resource.category || 'Digital Resource'}</Badge>
                <Badge className="capitalize text-xs">{resource.level || 'All Levels'}</Badge>
                <Badge variant="outline" className="text-xs">{resource.fileType}</Badge>
                <Badge className={`text-xs font-bold ${isFree ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                  {isFree ? 'Free' : `$${resource.amount}`}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description - Full width, maximum space */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Description</DialogTitle>
              <DialogDescription className="sr-only">Detailed description of the selected resource</DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-foreground/90 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resource.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-center">
          <Button 
            onClick={() => onPurchase?.(resource)} 
            className={`w-full sm:w-2/3 md:w-1/2 text-base py-5 sm:py-6 ${
              isFree
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white'
            }`}
          >
            Get Yours Now
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
