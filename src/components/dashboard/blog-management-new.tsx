"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import { blogsAPI, BlogPostWithRichContent } from "@/lib/blogs-api";
import { BlogPost } from "@/types/api";
import { constructImageUrl, getFallbackImage } from "@/lib/image-utils";
import { TiptapEditor } from "./tiptap-editor";
import { ArticleViewer } from "./article-viewer";

type ViewMode = "list" | "add" | "edit";

export function BlogManagementNew() {
  const { getAuthToken } = useAuth();
  const [blogs, setBlogs] = useState<BlogPostWithRichContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<BlogPostWithRichContent>>({
    title: "",
    content: "",
    contentHtml: "",
    author: "",
    image: "",
    excerpt: "",
    direction: "ltr",
    font: "system-ui",
    published: true,
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

  const getCreatedDate = (b: BlogPostWithRichContent) =>
    b.createdDate || b.created || b.created_at;

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
    if (!form.title?.trim() || !form.contentHtml?.trim() || !form.author?.trim()) {
      toast.error("Please fill in title, content, and author");
      return;
    }
    setSaving(true);
    try {
      if (isEditing && editingId != null) {
        await blogsAPI.updateWithRichContent(
          editingId,
          {
            title: form.title,
            description: form.excerpt || form.title,
            content: form.content || "",
            contentHtml: form.contentHtml,
            author: form.author,
            image: form.image,
            direction: form.direction as any,
            font: form.font,
          },
          thumbnailFile || undefined
        );
        toast.success("Blog updated successfully");
      } else {
        await blogsAPI.createWithRichContent(
          {
            title: form.title!,
            description: form.excerpt || form.title!,
            content: form.content || "",
            contentHtml: form.contentHtml!,
            author: form.author!,
            image: form.image,
            direction: form.direction as any,
            font: form.font,
            excerpt: form.excerpt,
            published: form.published ?? true,
          },
          thumbnailFile || undefined
        );
        toast.success("Blog created successfully");
      }
      setForm({
        title: "",
        content: "",
        contentHtml: "",
        author: "",
        image: "",
        excerpt: "",
        direction: "ltr",
        font: "system-ui",
        published: true,
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

  const handleDelete = async (blog: BlogPostWithRichContent) => {
    try {
      await blogsAPI.delete(blog.id!);
      toast.success("Blog deleted");
      await fetchBlogs();
    } catch (e: any) {
      console.error("Failed to delete blog", e);
      toast.error(e?.message || "Failed to delete blog.");
    }
  };

  const handleEdit = (blog: BlogPostWithRichContent) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      author: blog.author,
      content: blog.content,
      contentHtml: blog.contentHtml || "",
      image: blog.image || "",
      excerpt: blog.excerpt || "",
      direction: blog.direction || "ltr",
      font: blog.font || "system-ui",
      published: blog.published ?? true,
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setViewMode("edit");
  };

  const handleAdd = () => {
    setForm({
      title: "",
      content: "",
      contentHtml: "",
      author: "",
      image: "",
      excerpt: "",
      direction: "ltr",
      font: "system-ui",
      published: true,
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
          <h2 className="text-xl font-semibold">Blog Management</h2>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Blog
            </Button>
            <Button variant="outline" onClick={fetchBlogs} disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
                </span>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {viewMode !== "list" && (
          <div className="mb-4">
            <div className="space-y-4 p-4 border rounded-lg bg-white">
              <h2 className="text-lg font-semibold mb-2">
                {isEditing ? "Edit Blog" : "Add Blog"}
              </h2>

              {/* Basic Info */}
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

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Excerpt / Summary</label>
                <Textarea
                  placeholder="Brief description of the blog post..."
                  value={form.excerpt || ""}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-primary/20">
                <h3 className="text-lg font-semibold text-primary">
                  {viewMode === "edit" ? "Change Thumbnail Image" : "Thumbnail Upload"}
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {viewMode === "edit"
                      ? "Upload New Image (Optional)"
                      : "Featured Image/Thumbnail (Optional)"}
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
                        <div className="text-xs text-green-700 font-medium">
                          Selected: {thumbnailFile.name}
                        </div>
                        <div className="text-xs text-green-600">
                          Size: {(thumbnailFile.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {thumbnailPreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Thumbnail Preview:</label>
                    <div
                      className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-primary/20"
                      style={{ backgroundImage: `url(${thumbnailPreview})` }}
                    />
                  </div>
                )}

                {viewMode === "edit" && !thumbnailPreview && form.image && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Thumbnail:</label>
                    <div
                      className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-slate-200"
                      style={{
                        backgroundImage: `url(${constructImageUrl(
                          form.image,
                          getFallbackImage("blog")
                        )})`,
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

              {/* Rich Content Editor */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <label className="text-sm font-medium">Content (Rich Text) *</label>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant={!previewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewMode(false)}
                      className="flex-1 sm:flex-none"
                    >
                      Edit
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

                {!previewMode ? (
                  <TiptapEditor
                    value={form.contentHtml || ""}
                    onChange={(html) => setForm((f) => ({ ...f, contentHtml: html }))}
                    onDirectionChange={(dir) =>
                      setForm((f) => ({ ...f, direction: dir }))
                    }
                    onFontChange={(font) => setForm((f) => ({ ...f, font }))}
                    minHeight="500px"
                  />
                ) : (
                  <div className="border rounded-lg bg-white p-4 min-h-[500px]">
                    <ArticleViewer
                      contentHtml={form.contentHtml}
                      direction={form.direction}
                      font={form.font}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Save className="h-4 w-4" />{" "}
                      {isEditing ? "Save Changes" : "Create Blog"}
                    </span>
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
              <Card
                key={String(blog.id ?? blog.title)}
                className="flex flex-col overflow-hidden"
              >
                {/* Featured Image Header */}
                <div
                  className="h-32 w-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${constructImageUrl(
                      blog.image || blog.featuredImage,
                      getFallbackImage("blog")
                    )})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-2 right-2">
                    {blog.published === false && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                  <CardDescription>
                    <span className="mr-2">By {blog.author || "Unknown"}</span>
                    {getCreatedDate(blog) && (
                      <span className="text-xs text-muted-foreground">
                        • {new Date(getCreatedDate(blog)!).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-700 line-clamp-4 mb-4">
                    {blog.excerpt || blog.description}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(blog)}
                      className="inline-flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(blog)}
                      className="inline-flex items-center gap-2"
                    >
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
