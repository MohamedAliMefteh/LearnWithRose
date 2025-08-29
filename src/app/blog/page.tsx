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
import { CalendarDays, Feather, RefreshCw, Home } from "lucide-react";


export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {/* Navbar (same style as homepage) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ROSE Logo" width={56} height={56} className="h-14 w-14" />
              <span className="text-xl sm:text-2xl font-bold text-primary">Learn Arabic with ROSE</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#about" className="text-gray-800 hover:text-primary transition-colors">About</Link>
              <Link href="/#courses" className="text-gray-800 hover:text-primary transition-colors">Courses</Link>
              <Link href="/#resources" className="text-gray-800 hover:text-primary transition-colors">Resources</Link>
              <Link href="/#contact" className="text-gray-800 hover:text-primary transition-colors">Contact</Link>
              <Link href="/blog" className="text-gray-800 hover:text-primary transition-colors">Blog</Link>
              <Link href="/dashboard" className="text-gray-800 hover:text-primary transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero/Header */}
      <section className="relative py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <Badge className="px-3 py-1 bg-primary/10 text-primary border border-primary/20">Latest Insights</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">Rose's Arabic Learning Blog</h1>
            <p className="text-base sm:text-lg text-[hsl(var(--foreground))]/80 max-w-2xl mx-auto">
              Practical tips, cultural notes, and learning strategies to master Palestinian & Jordanian Arabic accents.
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

          {/* Posts grid */}
          {!loading && posts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <article key={(post.id ?? idx).toString()} className="group">
                  <Card className="overflow-hidden h-full border-primary/20 hover:shadow-lg transition-all duration-300">
                    {/* Banner/cover placeholder */}
                    <div className="h-40 w-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title || "Untitled"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {getExcerpt(post.content) || "No content available."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                          <Feather className="w-4 h-4" />
                          <span>{post.author || "Rose"}</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {formatDate(
                              post.createdDate || post.created || post.created_at || new Date().toISOString(),
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Link href={`/blog/${encodeURIComponent((post.id ?? idx).toString())}`} className="block">
                          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                            Read more
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
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
