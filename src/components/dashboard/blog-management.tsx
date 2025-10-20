"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import { blogsAPI } from "@/lib/blogs-api";
import { BlogPost } from "@/types/api";
import { constructImageUrl, getFallbackImage } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExcerpt(html?: string, maxLen: number = 200) {
  if (!html) return "";
  const text = stripHtml(html);
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

type ViewMode = "list" | "add" | "edit";

export function BlogManagement() {
  const { getAuthToken } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<BlogPost>>({ 
    title: "", 
    content: "", 
    author: "", 
    featuredImage: "", 
    excerpt: "", 
    published: true 
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | number | undefined>(undefined);
  const [saving, setSaving] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const getCreatedDate = (b: BlogPost) => b.createdDate || b.created || b.created_at;

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogsAPI.getAll();
      setBlogs(data);
    } catch (e: any) {
      console.error("Failed to fetch blogs", e);
      toast.error(e?.message || "Failed to fetch blogs. Please try again later.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = viewMode === "edit";

  const handleSave = async () => {
    if (!form.title?.trim() || !form.content?.trim() || !form.author?.trim()) {
      toast.error("Please fill in title, content, and author");
      return;
    }
    setSaving(true);
    try {
      if (isEditing && editingId != null) {
        // For editing with new thumbnail upload
        if (thumbnailFile) {
          // Use v2 API to update with new thumbnail - all data in FormData body (like create)
          const token = getAuthToken();
          const headers: HeadersInit = {
            'accept': '*/*'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // FormData contains all fields including metadata (to avoid 431 error with long content)
          const formDataUpload = new FormData();
          formDataUpload.append('title', form.title!);
          formDataUpload.append('description', form.excerpt || form.title!);
          formDataUpload.append('content', form.content!); // Content in FormData body to support long text
          formDataUpload.append('author', form.author!);
          formDataUpload.append('thumbnailFile', thumbnailFile);

          const response = await fetch(`/api/v2/articles/${editingId}/upload`, {
            method: "PUT",
            headers,
            body: formDataUpload,
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update blog: ${errorText}`);
          }
          toast.success("Blog updated successfully with new image");
        } else {
          // Use legacy API for updates without new thumbnail
          await blogsAPI.update(editingId, {
            title: form.title!,
            content: form.content!,
            author: form.author!,
            featuredImage: form.featuredImage,
            excerpt: form.excerpt,
            published: form.published,
          });
          toast.success("Blog updated successfully");
        }
      } else {
        // For new blogs, use v2 API with file upload
        const token = getAuthToken();
        const headers: HeadersInit = {
          'accept': '*/*'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const formDataUpload = new FormData();
        
        // Add metadata to FormData body instead of query params
        formDataUpload.append('title', form.title!);
        formDataUpload.append('description', form.excerpt || form.title!); // Use excerpt as description, fallback to title
        formDataUpload.append('content', form.content!); // Content in body to support longer text
        formDataUpload.append('author', form.author!);
        
        // Add optional thumbnail file
        if (thumbnailFile) {
          formDataUpload.append('thumbnailFile', thumbnailFile);
        }

        const response = await fetch(`/api/v2/articles/upload`, {
          method: "POST",
          headers,
          body: formDataUpload,
          // Note: Don't set Content-Type header for FormData, browser will set it with boundary
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create blog: ${errorText}`);
        }
        toast.success("Blog created successfully with v2 API");
      }
      setForm({ 
        title: "", 
        content: "", 
        author: "", 
        featuredImage: "", 
        excerpt: "", 
        published: true 
      });
      setThumbnailFile(null);
      setThumbnailPreview("");
      setEditingId(undefined);
      setViewMode("list");
      await fetchBlogs();
    } catch (e: any) {
      console.error("Failed to save blog", e);
      toast.error(e?.message || "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog: BlogPost) => {
    try {
      await blogsAPI.delete(blog.id!);
      toast.success("Blog deleted");
      await fetchBlogs();
    } catch (e: any) {
      console.error("Failed to delete blog", e);
      toast.error(e?.message || "Failed to delete blog. This action may not be available yet.");
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingId(blog.id);
    setForm({ 
      title: blog.title, 
      author: blog.author, 
      content: blog.content,
      featuredImage: blog.featuredImage || "",
      excerpt: blog.excerpt || "",
      published: blog.published ?? true
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setViewMode("edit");
  };

  const handleAdd = () => {
    setForm({ 
      title: "", 
      content: "", 
      author: "", 
      featuredImage: "", 
      excerpt: "", 
      published: true 
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setEditingId(undefined);
    setViewMode("add");
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingId(undefined);
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string || "");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Existing Blogs</h2>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Blog
            </Button>
            <Button variant="outline" onClick={fetchBlogs} disabled={loading}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Refreshing</span> : "Refresh"}
            </Button>
          </div>
        </div>

        {viewMode !== "list" && (
          <div className="mb-4">
            <div className="space-y-4 p-4 border rounded-lg bg-white">
              <h2 className="text-lg font-semibold mb-2">{isEditing ? "Edit Blog" : "Add Blog"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Enter blog title"
                    value={form.title || ""}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author *</label>
                  <Input
                    placeholder="Author name"
                    value={form.author || ""}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  />
                </div>
              </div>

              {/* Thumbnail Upload Section - Available for both Add and Edit */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-primary/20">
                <h3 className="text-lg font-semibold text-primary">
                  {viewMode === "edit" ? "Change Thumbnail Image" : "Thumbnail Upload"}
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {viewMode === "edit" ? "Upload New Image (Optional)" : "Featured Image/Thumbnail (Optional)"}
                  </label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    {thumbnailFile && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <div className="text-xs text-green-700 font-medium">Selected: {thumbnailFile.name}</div>
                        <div className="text-xs text-green-600">Size: {(thumbnailFile.size / 1024).toFixed(0)} KB</div>
                      </div>
                    )}
                  </div>
                  {viewMode === "edit" && !thumbnailFile && (
                    <p className="text-xs text-muted-foreground">
                      💡 Upload a new image to replace the current thumbnail, or leave empty to keep the existing one
                    </p>
                  )}
                </div>

                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Thumbnail Preview:</label>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-primary/20"
                      style={{ backgroundImage: `url(${thumbnailPreview})` }}
                    />
                  </div>
                )}

                {/* Show current image for editing */}
                {viewMode === "edit" && !thumbnailPreview && form.featuredImage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Thumbnail:</label>
                    <div 
                      className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-slate-200"
                      style={{
                        backgroundImage: `url(${constructImageUrl(form.featuredImage, getFallbackImage('blog'))})`
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Publication Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Publication Status</label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="published"
                      checked={form.published === true}
                      onChange={() => setForm((f) => ({ ...f, published: true }))}
                      className="text-primary"
                    />
                    <span className="text-sm">Published</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="published"
                      checked={form.published === false}
                      onChange={() => setForm((f) => ({ ...f, published: false }))}
                      className="text-primary"
                    />
                    <span className="text-sm">Draft</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Excerpt</label>
                <Textarea
                  placeholder="Brief description or summary of the blog post..."
                  value={form.excerpt || ""}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="text-sm font-medium">Content (Markdown)</label>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant={!previewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Write
                    </Button>
                    <Button
                      type="button"
                      variant={previewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                      className="flex-1 sm:flex-none"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white border rounded-md min-h-[400px] sm:min-h-[500px]">
                  {!previewMode ? (
                    // Markdown Editor
                    <div className="p-4">
                      <Textarea
                        placeholder="Write your blog content in Markdown...

Examples / أمثلة:
# Heading 1 / عنوان رئيسي
## Heading 2 / عنوان فرعي
### Heading 3 / عنوان صغير

**Bold text** / **نص عريض** and *italic text* / *نص مائل*

- Bullet point 1 / نقطة أولى
- Bullet point 2 / نقطة ثانية
  - Nested item / عنصر متداخل

1. Numbered item 1 / عنصر مرقم ١
2. Numbered item 2 / عنصر مرقم ٢

`inline code` / `كود مضمن`

```
code block / بلوك كود
```

> Blockquote / اقتباس

[Link text](https://example.com) / [نص الرابط](https://example.com)

![Image alt text](https://example.com/image.jpg) / ![نص بديل للصورة](https://example.com/image.jpg)

Arabic text direction: Use dir='rtl' for RTL paragraphs
اتجاه النص العربي: استخدم dir='rtl' للفقرات من اليمين لليسار"
                        value={form.content || ""}
                        onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                        className="min-h-[300px] sm:min-h-[350px] font-mono text-sm resize-none border-0 focus:ring-0"
                        dir="auto"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace, "Noto Sans Arabic", "Arabic UI Text"' }}
                      />
                    </div>
                  ) : (
                    // Markdown Preview
                    <div className="p-4">
                      <div className="prose prose-slate max-w-none">
                        {form.content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-2xl font-bold mb-4 mt-6 text-slate-900" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-xl font-semibold mb-3 mt-5 text-slate-800" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-medium mb-2 mt-4 text-slate-800" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="text-base leading-relaxed mb-4 text-slate-700" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</p>
                              ),
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  className="text-primary hover:text-primary/80 underline"
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
                                <pre className="bg-slate-100 border border-slate-200 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                                  {children}
                                </pre>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary/30 pl-6 py-2 my-6 bg-slate-50/50 rounded-r-lg" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>
                                  <div className="text-slate-600 italic">{children}</div>
                                </blockquote>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-6 space-y-2 mb-4" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-6 space-y-2 mb-4" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-base leading-relaxed text-slate-700" dir="auto" style={{ fontFamily: '"Noto Sans Arabic", "Arabic UI Text", system-ui, sans-serif' }}>{children}</li>
                              ),
                              img: ({ src, alt }) => (
                                <div className="my-6">
                                  <img 
                                    src={src} 
                                    alt={alt || ''} 
                                    className="rounded-lg shadow-md max-w-full h-auto mx-auto"
                                  />
                                  {alt && (
                                    <p className="text-center text-sm text-slate-500 mt-2 italic">{alt}</p>
                                  )}
                                </div>
                              ),
                            }}
                          >
                            {form.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="text-slate-500 italic text-center py-8">
                            Start writing in the "Write" tab to see the preview here...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Markdown Help */}
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border" dir="auto">
                  <strong>Markdown Tips / نصائح الماركداون:</strong>
                  <br />
                  <span className="font-mono">
                    # للعناوين / for headings, **عريض / bold**, *مائل / italic*, - للقوائم / for lists, `كود / code`, &gt; للاقتباس / for quotes
                  </span>
                  <br />
                  <strong>Arabic Support:</strong> Use dir="auto" for mixed content, automatic RTL/LTR detection
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> {isEditing ? "Save Changes" : "Create Blog"}</span>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="text-gray-600">No blogs found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Card key={String(blog.id ?? blog.title)} className="flex flex-col overflow-hidden">
                {/* Featured Image Header */}
                <div 
                  className="h-32 w-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${constructImageUrl(blog.featuredImage, getFallbackImage('blog'))})`
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-2 right-2">
                    {blog.published === false && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">Draft</span>
                    )}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription>
                    <span className="mr-2">By {blog.author || "Unknown"}</span>
                    {getCreatedDate(blog) && (
                      <span className="text-xs text-muted-foreground">• {new Date(getCreatedDate(blog)!).toLocaleDateString()}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                    {blog.excerpt || getExcerpt(blog.content)}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" onClick={() => handleEdit(blog)} className="inline-flex items-center gap-2">
                      <Edit2 className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(blog)} className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
