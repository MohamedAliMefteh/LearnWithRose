"use client";

import { getDirectionAttribute, getDirectionStyle } from "@/lib/direction-detector";
import { useMemo } from "react";

interface ArticleViewerProps {
  contentHtml?: string;
  contentMarkdown?: string;
  direction?: string;
  font?: string;
  className?: string;
}

/**
 * Renders article content as HTML with proper RTL/LTR support
 * Falls back to markdown content if HTML is not available
 * Sanitization is handled on the backend, but we add additional safety here
 */
export function ArticleViewer({
  contentHtml,
  contentMarkdown,
  direction,
  font,
  className = "",
}: ArticleViewerProps) {
  // Determine which content to display
  const content = contentHtml || contentMarkdown;
  
  // Get direction attribute for HTML
  const dirAttr = getDirectionAttribute(direction);
  const dirStyle = getDirectionStyle(direction);

  // Sanitize HTML on client side as additional protection
  const sanitizedHtml = useMemo(() => {
    if (!contentHtml) return "";
    
    // Create a temporary container to parse and sanitize
    const temp = document.createElement("div");
    temp.innerHTML = contentHtml;
    
    // Remove any script tags that might have slipped through
    const scripts = temp.querySelectorAll("script");
    scripts.forEach((script) => script.remove());
    
    return temp.innerHTML;
  }, [contentHtml]);

  if (!content) {
    return (
      <div className={`text-slate-500 italic ${className}`}>
        No content available
      </div>
    );
  }

  // If we have HTML content, render it with dangerouslySetInnerHTML
  if (contentHtml && sanitizedHtml) {
    return (
      <div
        dir={dirAttr}
        style={{
          direction: dirStyle,
          fontFamily: font || "system-ui, sans-serif",
        }}
        className={`prose prose-sm max-w-none ${className}`}
      >
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          className="break-words"
        />
      </div>
    );
  }

  // Fallback to markdown content
  return (
    <div
      dir={dirAttr}
      style={{
        direction: dirStyle,
        fontFamily: font || "system-ui, sans-serif",
      }}
      className={`prose prose-sm max-w-none whitespace-pre-wrap ${className}`}
    >
      {contentMarkdown}
    </div>
  );
}

/**
 * Lightweight article preview component for list views
 */
export function ArticlePreview({
  title,
  excerpt,
  author,
  direction,
  font,
  className = "",
}: {
  title: string;
  excerpt?: string;
  author?: string;
  direction?: string;
  font?: string;
  className?: string;
}) {
  const dirAttr = getDirectionAttribute(direction);
  const dirStyle = getDirectionStyle(direction);

  return (
    <div
      dir={dirAttr}
      style={{
        direction: dirStyle,
        fontFamily: font || "system-ui, sans-serif",
      }}
      className={className}
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {excerpt && (
        <p className="text-sm text-slate-600 mb-2 line-clamp-3">{excerpt}</p>
      )}
      {author && (
        <p className="text-xs text-slate-500">By {author}</p>
      )}
    </div>
  );
}
