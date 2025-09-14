"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DigitalResource } from "@/types/api";
import { DigitalResourceCard } from "@/components/cards/digital-resource-card";
import { Plus, Edit2, Trash2, ArrowLeft, Save, X, Upload, FileText, Image } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ViewMode = "list" | "add" | "edit";

export function DigitalResourcesManagement() {
  const { getAuthToken } = useAuth();
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingResource, setEditingResource] = useState<DigitalResource | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    fileType: "",
    filePath: "",
    externalUrl: "",
    accent: "",
    level: "",
    thumbnail: "",
    amount: 0
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("/api/v2/library-items", {
        headers
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`);
      }
      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load digital resources");
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = () => {
    setViewMode("add");
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      fileType: "",
      filePath: "",
      externalUrl: "",
      accent: "",
      level: "",
      thumbnail: "",
      amount: 0
    });
    setPdfFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const handleEditResource = (resource: DigitalResource) => {
    setEditingResource(resource);
    setViewMode("edit");
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      category: resource.category || "",
      fileType: resource.fileType || "",
      filePath: resource.filePath || "",
      externalUrl: resource.externalUrl || "",
      accent: resource.accent || "",
      level: resource.level || "",
      thumbnail: typeof resource.thumbnail === 'string' ? resource.thumbnail : "",
      amount: resource.amount || 0
    });
    setPdfFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      // Auto-fill file type based on file extension
      const extension = file.name.split('.').pop()?.toUpperCase();
      if (extension) {
        setFormData(prev => ({ ...prev, fileType: extension }));
      }
    }
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

  const handleSaveResource = () => {
    const save = async () => {
      try {
        if (viewMode === "edit" && editingResource) {
          // For editing, use the old API for now (can be updated later)
          const response = await fetch(`/api/library-items/${editingResource.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (!response.ok) throw new Error("Resource not found");
          toast.success("Resource updated successfully");
        } else {
          // For new resources, use v2 API with file uploads
          if (!pdfFile) {
            toast.error("Please select a PDF file to upload");
            return;
          }

          const formDataUpload = new FormData();
          formDataUpload.append('pdfFile', pdfFile);
          if (thumbnailFile) {
            formDataUpload.append('thumbnailFile', thumbnailFile);
          }

          // Build query parameters for v2 API
          const queryParams = new URLSearchParams({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            fileType: formData.fileType,
            accent: formData.accent,
            level: formData.level,
            amount: formData.amount.toString()
          });

          const token = getAuthToken();
          const headers: HeadersInit = {
            'accept': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`/api/v2/library-items/upload?${queryParams}`, {
            method: "POST",
            headers,
            body: formDataUpload,
            // Note: Don't set Content-Type header for FormData, browser will set it with boundary
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create resource: ${errorText}`);
          }
          toast.success("Resource created successfully with file upload");
        }
        fetchResources();
        setViewMode("list");
        setEditingResource(null);
      } catch (error) {
        console.error('Save error:', error);
        toast.error(`Failed to save resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    save();
  };

  const handleDeleteResource = (resourceId: string) => {
    const del = async () => {
      try {
        const token = getAuthToken();
        const headers: HeadersInit = {
          'accept': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/v2/library-items/${resourceId}`, {
          method: "DELETE",
          headers
        });
        if (!response.ok) throw new Error("Resource not found");
        fetchResources();
        toast.success("Resource deleted successfully");
      } catch (error) {
        toast.error("Failed to delete resource");
      }
    };
    del();
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingResource(null);
    setPdfFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  if (isLoading) {
    return <div>Loading digital resources...</div>;
  }

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              {viewMode === "edit" ? "Edit Resource" : "Add New Resource"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Resource title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Input
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Resource category"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Resource description"
                  rows={3}
                />
              </div>

              {/* File Upload Section for v2 API */}
              {viewMode === "add" && (
                <div className="space-y-6 p-4 bg-muted/30 rounded-lg border-2 border-dashed border-primary/20">
                  <h3 className="text-lg font-semibold text-primary">File Uploads (v2 API)</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF/Document File *
                      </label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          onChange={handlePdfFileChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                        />
                        {pdfFile && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <div className="text-xs text-green-700 font-medium">Selected: {pdfFile.name}</div>
                            <div className="text-xs text-green-600">Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Thumbnail Image (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                        />
                        {thumbnailFile && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-700 font-medium">Selected: {thumbnailFile.name}</div>
                            <div className="text-xs text-blue-600">Size: {(thumbnailFile.size / 1024).toFixed(0)} KB</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {thumbnailPreview && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Thumbnail Preview:</label>
                      <div 
                        className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-primary/20"
                        style={{ backgroundImage: `url(${thumbnailPreview})` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Legacy fields for editing existing resources */}
              {viewMode === "edit" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">File Path</label>
                    <Input
                      value={formData.filePath}
                      onChange={e => setFormData({ ...formData, filePath: e.target.value })}
                      placeholder="/files/resource.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">External URL</label>
                    <Input
                      value={formData.externalUrl}
                      onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
                      placeholder="https://example.com/resource"
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">File Type {viewMode === "add" ? "(Auto-filled)" : "*"}</label>
                  <Input
                    required={viewMode === "edit"}
                    value={formData.fileType}
                    onChange={e => setFormData({ ...formData, fileType: e.target.value })}
                    placeholder="e.g. PDF, DOCX, PPTX"
                    disabled={viewMode === "add" && !!pdfFile} // Auto-filled for new uploads
                  />
                </div>
                {viewMode === "edit" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail URL</label>
                    <Input
                      value={formData.thumbnail}
                      onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="/images/thumbnail.jpg"
                    />
                    {formData.thumbnail && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                        <div 
                          className="w-full h-20 bg-cover bg-center rounded border"
                          style={{
                            backgroundImage: `url(${formData.thumbnail.startsWith('http') 
                              ? formData.thumbnail 
                              : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}${formData.thumbnail}`})`
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Accent</label>
                  <Input
                    value={formData.accent}
                    onChange={e => setFormData({ ...formData, accent: e.target.value })}
                    placeholder="Accent value"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <Input
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Level value"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Amount</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSaveResource}>
                  <Save className="h-4 w-4 mr-2" />
                  {viewMode === "edit" ? "Update Resource" : "Add Resource"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Digital Resources Management</CardTitle>
            <p className="text-gray-600 mt-2">
              Manage downloadable resources for your students
            </p>
          </div>
          <Button onClick={handleAddResource}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="relative group">
              <DigitalResourceCard resource={resource} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur-sm"
                    onClick={() => handleEditResource(resource)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteResource(String(resource.id))}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
        {resources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No resources available</p>
            <Button onClick={handleAddResource}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Resource
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
