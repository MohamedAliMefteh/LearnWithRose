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
import { CalendarDays, Feather, Home, ArrowLeft, Clock, Eye, BookOpen, Menu, X as CloseIcon, Share2, Link as LinkIcon, Facebook, Twitter, Linkedin, Check, ArrowUp } from "lucide-react";
import { constructImageUrl, getFallbackImage, convertByteDataToImageUrl } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "@/components/layout/Footer";


export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = decodeURIComponent(params?.id ?? "");

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

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

  // Load related posts
  useEffect(() => {
    const loadRelatedPosts = async () => {
      try {
        const allPosts = await blogsAPI.getAll();
        const filtered = Array.isArray(allPosts) 
          ? allPosts.filter(p => p.id !== post?.id).slice(0, 3)
          : [];
        setRelatedPosts(filtered);
      } catch (err) {
        console.error('Failed to load related posts:', err);
      }
    };

    if (post) {
      loadRelatedPosts();
    }
  }, [post]);

  // Scroll progress and back to top
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate reading progress
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(scrollPercentage, 100));
      
      // Show back to top button after scrolling 300px
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: 'facebook' | 'x' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || 'Check out this article');

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      {/* Enhanced Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        {/* Modern Reading Progress Bar - Under Navbar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/50 transition-all duration-150 ease-out relative"
            style={{ width: `${readingProgress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/altlogo.png" 
                alt="ROSE Logo" 
                width={56} 
                height={56} 
                className="h-12 w-12 sm:h-14 sm:w-14" 
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate max-w-[180px] sm:max-w-none">
                Learn Arabic with Rose
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/#about" className="text-gray-800 hover:text-primary transition-colors font-medium">About</Link>
              <Link href="/#courses" className="text-gray-800 hover:text-primary transition-colors font-medium">Courses</Link>
              <Link href="/#resources" className="text-gray-800 hover:text-primary transition-colors font-medium">Resources</Link>
              <Link href="/#contact" className="text-gray-800 hover:text-primary transition-colors font-medium">Contact</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 hover:text-primary hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
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
                    <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1.5">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Article
                    </Badge>
                    {post.published === false && (
                      <Badge className="bg-yellow-500/90 backdrop-blur-md text-white border border-yellow-400/30 px-3 py-1.5">
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight tracking-tight max-w-5xl">
                    {post.title || "Untitled"}
                  </h1>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 leading-relaxed max-w-4xl">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-white/80">
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
                      <span>{calculateReadTime(post.content)} min read</span>
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
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Main Article Column */}
              <article className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
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
                      <div
                        style={{
                          maxWidth: readingMode ? '65ch' : 'none',
                          margin: readingMode ? '0 auto' : '0',
                        }}
                      >
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
                      >
                        {post.content || ''}
                      </ReactMarkdown>
                      </div>
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
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                {/* Author Card */}
                <div className="sticky top-24 space-y-6">
                  <div className="bg-gradient-to-br from-white to-primary/5 rounded-3xl shadow-lg border border-primary/20 p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">About the Author</h3>
                    <div className="space-y-4">
                      <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl"></div>
                        <Image 
                          src="/altlogo.png" 
                          alt="ROSE Logo" 
                          width={80} 
                          height={80} 
                          className="relative h-20 w-20 rounded-full border-4 border-white shadow-lg" 
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{post.author || "Rose"}</h4>
                        <p className="text-slate-600 text-sm mb-3">💛 Palestinian-Jordanian Dialect Teacher</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Teaching Arabic dialects with passion and cultural depth. Join me on this language learning journey!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Share Section */}
                  <div className="bg-gradient-to-br from-white to-accent/5 rounded-3xl shadow-lg border border-primary/20 p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share Article
                    </h3>
                    <div className="space-y-3">
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        className="w-full justify-start border-primary/30 hover:bg-primary/5 hover:border-primary transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            <span className="text-green-600">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleShare('facebook')}
                        variant="outline"
                        className="w-full justify-start border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all"
                      >
                        <Facebook className="w-4 h-4 mr-2" />
                        Share on Facebook
                      </Button>
                      <Button
                        onClick={() => handleShare('x')}
                        variant="outline"
                        className="w-full justify-start border-slate-200 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Share on X
                      </Button>
                      <Button
                        onClick={() => handleShare('linkedin')}
                        variant="outline"
                        className="w-full justify-start border-blue-200 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        Share on LinkedIn
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button
                        onClick={() => router.push("/blog")}
                        variant="outline"
                        className="w-full justify-start border-primary/30 hover:bg-primary/5 hover:border-primary"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        More Articles
                      </Button>
                      <Link href="/" className="block">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-primary/30 hover:bg-primary/5 hover:border-primary"
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
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

      {/* Related Articles Section */}
      {!loading && post && relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  href={`/blog/${relatedPost.id}`}
                  className="group block"
                >
                  <div className="h-full overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div 
                      className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${convertByteDataToImageUrl(relatedPost.thumbnail || relatedPost.image, getFallbackImage('blog'))})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {relatedPost.excerpt || relatedPost.description || ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
        </button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

function calculateReadTime(content?: string): number {
  if (!content) return 1;
  
  // Remove markdown syntax and HTML tags
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
  
  // Count words (average reading speed is 200-250 words per minute)
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const readingSpeed = 225; // words per minute (average)
  const minutes = Math.ceil(words / readingSpeed);
  
  // Return at least 1 minute
  return Math.max(1, minutes);
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
