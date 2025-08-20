"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BioData } from "@/types/api";
import { bioAPI } from "@/lib/bio-api";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function BioManagement() {
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BioData>>({
    heroSection: {
      title: "",
      description: "",
      tag: "",
      stats: {
        studentsTaught: "",
        averageRating: "",
        yearsExperience: ""
      }
    },
    meetYourTeacher: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchBioData();
  }, []);

  const fetchBioData = async () => {
    try {
      setHasError(false);
      const data = await bioAPI.get();
      setBioData(data);
      setFormData(data || {
        heroSection: {
          title: "",
          description: "",
          tag: "",
          stats: {
            studentsTaught: "",
            averageRating: "",
            yearsExperience: ""
          }
        },
        meetYourTeacher: []
      });
    } catch (error) {
      console.error("Error fetching bio data:", error);
      setHasError(true);
      // Don't show error toast, just handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedData = await bioAPI.save(formData as BioData);
      setBioData(updatedData);
      setIsEditing(false);
      setHasError(false);
      toast.success("Bio data saved successfully");
    } catch (error) {
      toast.error("Failed to save bio data");
      console.error("Error saving bio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(bioData || {
      heroSection: {
        title: "",
        description: "",
        tag: "",
        stats: {
          studentsTaught: "",
          averageRating: "",
          yearsExperience: ""
        }
      },
      meetYourTeacher: []
    });
    setIsEditing(false);
  };

  const addTeacherItem = () => {
    setFormData({
      ...formData,
      meetYourTeacher: [
        ...(formData.meetYourTeacher || []),
        { title: "", description: "" }
      ]
    });
  };

  const removeTeacherItem = (index: number) => {
    const updatedItems = [...(formData.meetYourTeacher || [])];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      meetYourTeacher: updatedItems
    });
  };

  const updateTeacherItem = (index: number, field: 'title' | 'description', value: string) => {
    const updatedItems = [...(formData.meetYourTeacher || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData({
      ...formData,
      meetYourTeacher: updatedItems
    });
  };

  const updateHeroSection = (field: string, value: string) => {
    if (field.startsWith('stats.')) {
      const statsField = field.replace('stats.', '');
      setFormData({
        ...formData,
        heroSection: {
          ...formData.heroSection!,
          stats: {
            ...formData.heroSection!.stats,
            [statsField]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        heroSection: {
          ...formData.heroSection!,
          [field]: value
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bio Information</CardTitle>
          <CardDescription>
            Manage your personal information displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading bio data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render the bio section if there's an error
  if (hasError) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Bio Information</CardTitle>
            <CardDescription>
              Manage your personal information displayed on the homepage
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              {bioData ? "Edit Bio" : "Create Bio"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Hero Section</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.heroSection?.title || ""}
                  onChange={(e) => updateHeroSection('title', e.target.value)}
                  placeholder="Master Authentic Palestinian & Lebanese Arabic Accents"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.heroSection?.description || ""}
                  onChange={(e) => updateHeroSection('description', e.target.value)}
                  placeholder="Learn from a native speaker with 8+ years of teaching experience..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Input
                  value={formData.heroSection?.tag || ""}
                  onChange={(e) => updateHeroSection('tag', e.target.value)}
                  placeholder="Native Arabic Speaker"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Students Taught</label>
                  <Input
                    value={formData.heroSection?.stats?.studentsTaught || ""}
                    onChange={(e) => updateHeroSection('stats.studentsTaught', e.target.value)}
                    placeholder="500+"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Rating</label>
                  <Input
                    value={formData.heroSection?.stats?.averageRating || ""}
                    onChange={(e) => updateHeroSection('stats.averageRating', e.target.value)}
                    placeholder="4.9★"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years Experience</label>
                  <Input
                    value={formData.heroSection?.stats?.yearsExperience || ""}
                    onChange={(e) => updateHeroSection('stats.yearsExperience', e.target.value)}
                    placeholder="8+"
                  />
                </div>
              </div>
            </div>

            {/* Meet Your Teacher Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meet Your Teacher</h3>
                <Button onClick={addTeacherItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {formData.meetYourTeacher?.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button 
                      onClick={() => removeTeacherItem(index)} 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateTeacherItem(index, 'title', e.target.value)}
                      placeholder="Certified Educator"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateTeacherItem(index, 'description', e.target.value)}
                      placeholder="Specialized training in dialect instruction..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {(!formData.meetYourTeacher || formData.meetYourTeacher.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No teacher items yet. Click "Add Item" to get started.
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : bioData ? (
          <div className="space-y-8">
            {/* Hero Section Display */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Hero Section</h3>
              
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Title</h4>
                  <p className="text-gray-600">{bioData.heroSection.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{bioData.heroSection.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tag</h4>
                  <p className="text-gray-600">{bioData.heroSection.tag}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {bioData.heroSection.stats.studentsTaught}
                  </div>
                  <div className="text-sm text-gray-600">Students Taught</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {bioData.heroSection.stats.averageRating}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {bioData.heroSection.stats.yearsExperience}
                  </div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Meet Your Teacher Display */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Meet Your Teacher</h3>
              
              <div className="grid gap-4">
                {bioData.meetYourTeacher.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              No bio information found. Click "Create Bio" to add your information.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
