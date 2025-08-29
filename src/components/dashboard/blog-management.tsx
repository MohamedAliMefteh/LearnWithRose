"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Loader2, Save, X } from "lucide-react";
import { blogsAPI } from "@/lib/blogs-api";
import { BlogPost } from "@/types/api";

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
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<Partial<BlogPost>>({ title: "", content: "", author: "" });
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | number | undefined>(undefined);
  const [saving, setSaving] = useState<boolean>(false);

  // CKEditor dynamic modules (client-only)
  const [CKEditor, setCKEditor] = useState<any>(null);
  const [Editor, setEditor] = useState<any>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Load CKEditor only on client to avoid SSR issues
    let mounted = true;
    import("@ckeditor/ckeditor5-react")
      .then((m) => mounted && setCKEditor(() => m.CKEditor))
      .catch((e) => console.warn("Failed to load CKEditor React module", e));
    import("@ckeditor/ckeditor5-build-decoupled-document")
      .then((m) => mounted && setEditor(() => m.default))
      .catch((e) => console.warn("Failed to load CKEditor Decoupled Document build", e));
    return () => {
      mounted = false;
    };
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
        await blogsAPI.update(editingId, {
          title: form.title!,
          content: form.content!,
          author: form.author!,
        });
        toast.success("Blog updated successfully");
      } else {
        await blogsAPI.create({
          title: form.title!,
          content: form.content!,
          author: form.author!,
        });
        toast.success("Blog added successfully");
      }
      setForm({ title: "", content: "", author: "" });
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
    setForm({ title: blog.title, author: blog.author, content: blog.content });
    setViewMode("edit");
  };

  const handleAdd = () => {
    setForm({ title: "", content: "", author: "" });
    setEditingId(undefined);
    setViewMode("add");
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingId(undefined);
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Enter blog title"
                    value={form.title || ""}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    placeholder="Author name"
                    value={form.author || ""}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <div className="bg-white border rounded-md">
                  <div className="px-2 py-1 border-b" id="ckeditor-toolbar-container" ref={toolbarRef} />
                  <div className="p-2">
                    {CKEditor && Editor ? (
                      <CKEditor
                        editor={Editor}
                        data={form.content || ""}
                        onReady={(editor: any) => {
                          try {
                            const toolbarContainer = toolbarRef.current || document.getElementById("ckeditor-toolbar-container");
                            const toolbarElement = editor.ui.view.toolbar.element;
                            if (toolbarContainer && toolbarElement) {
                              while (toolbarContainer.firstChild) {
                                toolbarContainer.removeChild(toolbarContainer.firstChild);
                              }
                              toolbarContainer.appendChild(toolbarElement);
                            }
                          } catch (err) {
                            console.warn("Failed to mount CKEditor decoupled toolbar", err);
                          }
                        }}
                        onChange={(_event: any, editor: any) => {
                          const data = editor.getData();
                          setForm((f) => ({ ...f, content: data }));
                        }}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "removeFormat",
                            "|",
                            "alignment",
                            "outdent",
                            "indent",
                            "|",
                            "bulletedList",
                            "numberedList",
                            "blockQuote",
                            "codeBlock",
                            "horizontalLine",
                            "|",
                            "link",
                            "uploadImage",
                            "insertTable",
                            "mediaEmbed",
                            "|",
                            "undo",
                            "redo",
                          ],
                        }}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground p-4">Loading editor…</div>
                    )}
                  </div>
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
              <Card key={String(blog.id ?? blog.title)} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{blog.title}</CardTitle>
                  <CardDescription>
                    <span className="mr-2">By {blog.author || "Unknown"}</span>
                    {getCreatedDate(blog) && (
                      <span className="text-xs text-muted-foreground">• {new Date(getCreatedDate(blog)!).toLocaleDateString()}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">{getExcerpt(blog.content)}</p>
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
