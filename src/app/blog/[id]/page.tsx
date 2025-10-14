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
import { CalendarDays, Feather, Home, ArrowLeft, Clock, Eye, BookOpen, Menu, X } from "lucide-react";
import { constructImageUrl, getFallbackImage, convertByteDataToImageUrl } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = decodeURIComponent(params?.id ?? "");

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const load = async () => {
    if (!postId) {
      setError("No blog post ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await blogsAPI.getById(postId);
      setPost(data);
    } catch (e: any) {
      console.error("Blog fetch failed:", e);
      setError(e?.message || "Failed to load blog post.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Enhanced Modern Navbar */}
      <nav className="bg-white/98 backdrop-blur-2xl border-b border-slate-200/80 sticky top-0 z-50 shadow-lg shadow-slate-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-4 group py-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl scale-0 group-hover:scale-110 transition-all duration-500 ease-out" />
                <div className="relative bg-white rounded-2xl p-2 shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Image 
                    src="/altlogo.png" 
                    alt="ROSE Logo" 
                    width={40} 
                    height={40} 
                    className="h-10 w-10 transition-transform group-hover:scale-110 duration-300" 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                  Learn Arabic with ROSE
                </span>
                <span className="text-xs text-slate-500 font-medium tracking-wide">Arabic Language Learning</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-slate-50/80 rounded-2xl p-1">
                <Link 
                  href="/#about" 
                  className="px-4 py-2.5 text-slate-700 hover:text-primary hover:bg-white rounded-xl transition-all duration-200 font-medium text-sm hover:shadow-sm"
                >
                  About
                </Link>
                <Link 
                  href="/#courses" 
                  className="px-4 py-2.5 text-slate-700 hover:text-primary hover:bg-white rounded-xl transition-all duration-200 font-medium text-sm hover:shadow-sm"
                >
                  Courses
                </Link>
                <Link 
                  href="/#resources" 
                  className="px-4 py-2.5 text-slate-700 hover:text-primary hover:bg-white rounded-xl transition-all duration-200 font-medium text-sm hover:shadow-sm"
                >
                  Resources
                </Link>
                <Link 
                  href="/blog" 
                  className="px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Blog
                </Link>
              </div>
              <div className="ml-4">
                <Link 
                  href="/dashboard" 
                  className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-primary hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200/60 mt-2 pt-4 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Link 
                href="/#about" 
                className="block px-4 py-3 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/#courses" 
                className="block px-4 py-3 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                href="/#resources" 
                className="block px-4 py-3 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                href="/blog" 
                className="block px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold border-l-4 border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <div className="pt-2 mt-4 border-t border-slate-200/60">
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold text-center shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero Background */}
        <div className="relative h-[50vh] sm:h-[60vh] min-h-[300px] sm:min-h-[400px] max-h-[600px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: post ? `url(${post.thumbnail ? convertByteDataToImageUrl(post.thumbnail, getFallbackImage('blog')) : (() => {
                const imageUrl = post.featuredImage || post.image;
                return constructImageUrl(
                  typeof imageUrl === 'string' ? imageUrl : null, 
                  getFallbackImage('blog')
                );
              })()})` : `url(${getFallbackImage('blog')})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
          
          {/* Floating Navigation */}
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="ghost"
              onClick={() => router.push("/blog")}
              className="bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </div>
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-white/20" />
                  <Skeleton className="h-6 w-1/2 bg-white/20" />
                  <Skeleton className="h-4 w-2/3 bg-white/20" />
                </div>
              ) : post ? (
                <>
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Article
                    </Badge>
                    {post.published === false && (
                      <Badge className="bg-yellow-500/90 backdrop-blur-md text-white border border-yellow-400/30 px-3 py-1">
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                    {post.title || "Untitled"}
                  </h1>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 leading-relaxed max-w-3xl">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta Information */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Feather className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{post.author || "Rose"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <span>{formatDate(post.createdDate || (post as any).created || (post as any).created_at || new Date().toISOString())}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>{Math.ceil((post.content?.length || 1000) / 200)} min read</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    Post Not Found
                  </h1>
                  <p className="text-xl text-white/80">The blog post you're looking for doesn't exist or has been moved.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Content Area */}
      <section className="relative -mt-16 sm:-mt-20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 lg:p-12">
              <div className="space-y-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/6" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          ) : post ? (
            <>
              {/* Main Article Card */}
              <article className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
                {/* Decorative Header */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
                
                {/* Article Actions Bar */}
                <div className="border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReadingMode(!readingMode)}
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          readingMode 
                            ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                            : 'text-slate-600 hover:text-primary hover:bg-slate-100'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {readingMode ? 'Exit Reading Mode' : 'Reading Mode'}
                        </span>
                      </Button>
                    </div>
                    {readingMode && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="hidden sm:inline">Focus Mode Active</span>
                        <span className="sm:hidden">Focus Mode</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Article Content */}
                <div className={`transition-all duration-300 ${
                  readingMode ? 'p-4 sm:p-8 lg:p-16 bg-slate-50/50' : 'p-4 sm:p-6 lg:p-12'
                }`}>
                  {post.content ? (
                    <div className={`prose prose-slate max-w-none transition-all duration-300 ${
                      readingMode 
                        ? 'prose-xl prose-slate prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:leading-loose prose-headings:font-bold prose-a:text-primary prose-strong:text-slate-900 prose-code:text-primary prose-pre:bg-slate-100' 
                        : 'prose-lg prose-a:text-primary prose-strong:text-slate-800 prose-code:text-primary prose-pre:bg-slate-50'
                    }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className={`transition-all duration-300 ${
                          readingMode 
                            ? 'leading-loose text-slate-800' 
                            : 'leading-relaxed text-slate-700'
                        }`}
                        components={{
                          // Custom styling for different elements with Arabic support
                          h1: ({ children }) => (
                            <h1 
                              className={`font-bold ${readingMode ? 'text-3xl mb-6 mt-8' : 'text-2xl mb-4 mt-6'} text-slate-900`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 
                              className={`font-semibold ${readingMode ? 'text-2xl mb-5 mt-7' : 'text-xl mb-3 mt-5'} text-slate-800`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 
                              className={`font-medium ${readingMode ? 'text-xl mb-4 mt-6' : 'text-lg mb-2 mt-4'} text-slate-800`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p 
                              className={`${readingMode ? 'text-xl leading-loose mb-6' : 'text-lg leading-relaxed mb-4'} text-slate-700`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </p>
                          ),
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
                              target={href?.startsWith('http') ? '_blank' : undefined}
                              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-slate-100 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className={`bg-slate-100 border border-slate-200 rounded-lg p-4 overflow-x-auto ${readingMode ? 'text-base' : 'text-sm'} font-mono`}>
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote 
                              className="border-l-4 border-primary/30 pl-6 py-2 my-6 bg-slate-50/50 rounded-r-lg"
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              <div className="text-slate-600 italic">
                                {children}
                              </div>
                            </blockquote>
                          ),
                          ul: ({ children }) => (
                            <ul 
                              className={`list-disc pl-6 ${readingMode ? 'space-y-3 mb-6' : 'space-y-2 mb-4'}`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol 
                              className={`list-decimal pl-6 ${readingMode ? 'space-y-3 mb-6' : 'space-y-2 mb-4'}`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li 
                              className={`${readingMode ? 'text-lg leading-loose' : 'text-base leading-relaxed'} text-slate-700`}
                              dir="auto"
                              style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}
                            >
                              {children}
                            </li>
                          ),
                          img: ({ src, alt }) => (
                            <div className="my-8">
                              <img 
                                src={src} 
                                alt={alt || ''} 
                                className="rounded-lg shadow-md max-w-full h-auto mx-auto"
                                loading="lazy"
                              />
                              {alt && (
                                <p className="text-center text-sm text-slate-500 mt-2 italic">{alt}</p>
                              )}
                            </div>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full border border-slate-200 rounded-lg">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-800">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-slate-200 px-4 py-2 text-slate-700">
                              {children}
                            </td>
                          ),
                        }}
                        style={{
                          maxWidth: readingMode ? '65ch' : 'none',
                          margin: readingMode ? '0 auto' : '0',
                        }}
                      >
                        {post.content || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 text-lg">No content available for this post.</p>
                    </div>
                  )}
                </div>
              </article>
              
              {/* Author Section */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 lg:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Feather className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Written by {post.author || "Rose"}</h3>
                    <p className="text-slate-600 text-sm">Arabic Language Educator</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-red-200 p-8 lg:p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Article Not Found</h2>
              <p className="text-red-600 mb-6">The blog post you're looking for doesn't exist or has been moved.</p>
              {error && <p className="text-red-500 text-sm mb-6 bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex items-center justify-center gap-4">
                <Link href="/blog">
                  <Button className="bg-primary hover:bg-primary/90">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Bottom Navigation */}
      <section className="mt-12 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60">
            <Button
              variant="outline"
              onClick={() => router.push("/blog")}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-primary hover:text-primary transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> More Articles
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="text-sm">Enjoyed this article?</span>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-primary">
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
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
