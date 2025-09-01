"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { blogsAPI } from "@/lib/blogs-api";
import { BlogPost } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Feather, Home, ArrowLeft } from "lucide-react";


export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = decodeURIComponent(params?.id ?? "");

  const [posts, setPosts] = useState<BlogPost[] | null>(null);
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
      setError(e?.message || "Failed to load blog posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const post: BlogPost | null = useMemo(() => {
    if (!posts) return null;
    const found = posts.find((p, idx) => (p.id ?? idx).toString() === postId);
    return found || null;
  }, [posts, postId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      {/* Navbar (same style as homepage) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/altlogo.png" alt="ROSE Logo" width={56} height={56} className="h-14 w-14" />
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

      {/* Hero/Header with gradient cover */}
      <section className="relative pb-6 pt-10 sm:pt-14 lg:pt-16">
        <div className="absolute inset-0 h-40 sm:h-56 lg:h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md border border-primary/20 rounded-xl shadow-md p-5 sm:p-7 lg:p-8">
            {loading ? (
              <>
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : post ? (
              <>
                <Badge className="mb-3 bg-primary/10 text-primary border border-primary/20">Blog Post</Badge>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
                  {post.title || "Untitled"}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Feather className="w-4 h-4" />
                    {post.author || "Rose"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(post.createdDate || (post as any).created || (post as any).created_at || new Date().toISOString())}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
                  Post not found
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">It may have been moved or removed.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Content area */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/6" />
              <Skeleton className="h-5 w-3/6" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : post ? (
            <article className="bg-white rounded-xl shadow-sm border border-primary/20 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary/40 via-accent/40 to-secondary/40" />
              <Card className="border-0 shadow-none">
                <CardContent className="prose max-w-none p-6 sm:p-8 lg:p-10">
                  {post.content ? (
                    <div
                      className="prose prose-neutral max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  ) : (
                    <div className="text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg">No content available.</div>
                  )}
                </CardContent>
              </Card>
            </article>
          ) : (
            <Card className="border-red-200 bg-red-50/60">
              <CardContent className="py-6 px-6">
                <h3 className="text-red-700 font-semibold mb-1">We couldn't find that blog post</h3>
                {error && <p className="text-red-600/90 text-sm">{error}</p>}
                <div className="mt-4 flex gap-3">
                  <Link href="/blog" className="inline-flex">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                    </Button>
                  </Link>
                  <Link href="/" className="inline-flex">
                    <Button variant="ghost" className="text-red-700 hover:text-red-800">
                      <Home className="w-4 h-4 mr-2" /> Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer actions */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/blog")}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
            <Link href="/">
              <Button variant="ghost">
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
