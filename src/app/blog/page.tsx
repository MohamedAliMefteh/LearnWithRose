"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogsAPI } from "@/lib/blogs-api";
import { BlogPost } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Feather, RefreshCw, Home, Menu, X } from "lucide-react";
import { convertByteDataToImageUrl, getFallbackImage } from "@/lib/image-utils";
import Footer from "@/components/layout/Footer";


export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogsAPI.getAll();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Blog fetch failed:", e);
      setError(e?.message || "Failed to load blog posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      {/* Enhanced Navbar with Mobile Menu */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/altlogo.png" alt="ROSE Logo" width={56} height={56} className="h-12 w-12 sm:h-14 sm:w-14" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate">Learn Arabic with Rose</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/#about" className="text-gray-800 hover:text-primary transition-colors font-medium">About</Link>
              <Link href="/#courses" className="text-gray-800 hover:text-primary transition-colors font-medium">Courses</Link>
              <Link href="/#resources" className="text-gray-800 hover:text-primary transition-colors font-medium">Resources</Link>
              <Link href="/#contact" className="text-gray-800 hover:text-primary transition-colors font-medium">Contact</Link>
              <Link href="/blog" className="text-primary font-semibold border-b-2 border-primary">Blog</Link>
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
              <Link 
                href="/#about" 
                className="block px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/#courses" 
                className="block px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                href="/#resources" 
                className="block px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                href="/#contact" 
                className="block px-4 py-3 text-gray-800 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/blog" 
                className="block px-4 py-3 bg-primary/10 text-primary rounded-lg font-semibold border-l-4 border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero/Header */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-accent/10 border border-primary/20 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary">Latest Insights & Tips</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              Rose's <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Arabic Learning</span> Blog
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--foreground))]/70 max-w-3xl mx-auto leading-relaxed">
              Practical tips, cultural notes, and learning strategies to master Palestinian & Jordanian Arabic dialects. 💛
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Error state */}
          {error && !loading && (
            <Card className="border-red-200 bg-red-50/60">
              <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-red-700 font-semibold mb-1">We couldn't load blog posts</h3>
                  <p className="text-red-600/90 text-sm">{error}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={load} className="border-red-300 text-red-700 hover:bg-red-100">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                  <Link href="/" className="inline-flex">
                    <Button variant="ghost" className="text-red-700 hover:text-red-800">
                      <Home className="w-4 h-4 mr-2" /> Go Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex items-center gap-3 pt-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Feather className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No blog posts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Check back soon for new lessons, cultural insights, and study tips from Rose.
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90">Explore Courses</Button>
              </Link>
            </div>
          )}

          {/* Posts grid with consistent heights */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {posts.map((post, idx) => (
                <article key={(post.id ?? idx).toString()} className="group h-full">
                  <Card className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                    {/* Modern gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-[1px]">
                      <div className="bg-white rounded-3xl h-full w-full" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Enhanced Featured Image */}
                      <div 
                        className="relative h-48 sm:h-56 md:h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden group-hover:scale-105 transition-all duration-700 ease-out"
                        style={{
                          backgroundImage: `url(${convertByteDataToImageUrl(post.thumbnail || post.image, getFallbackImage('blog'))})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Modern layered gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
                        
                        {/* Author badge */}
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                          <Badge className="bg-white/90 backdrop-blur-md text-primary border-white/40 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                            <Feather className="w-3 h-3 mr-1" />
                            {post.author || "Rose"}
                          </Badge>
                        </div>
                        
                        {post.published === false && (
                          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                            <Badge className="bg-yellow-500/90 backdrop-blur-md text-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">Draft</Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Content section */}
                      <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6">
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title || "Untitled"}
                        </CardTitle>
                        
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                          {post.description || post.excerpt || getExcerpt(post.content) || "No content available."}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                            <span className="font-medium">
                              {formatDate(
                                post.createdDate || post.created || post.created_at || new Date().toISOString(),
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action button */}
                        <div className="mt-auto">
                          <Link href={`/blog/${encodeURIComponent((post.id ?? idx).toString())}`} className="block">
                            <Button className="w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              Read Article →
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ") // remove tags
    .replace(/&nbsp;/g, " ") // common CKEditor entity
    .replace(/\s+/g, " ")
    .trim();
}

function getExcerpt(html?: string, maxLen: number = 160) {
  if (!html) return "";
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
