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
import { Edit2, Save, X, Upload } from "lucide-react";
import { toast } from "sonner";

export function BioManagement() {
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BioData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBioData();
  }, []);

  const fetchBioData = async () => {
    try {
      const data = await bioAPI.get();
      setBioData(data);
      setFormData(data || {});
    } catch (error) {
      toast.error("Failed to load bio data");
      console.error("Error fetching bio data:", error);
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
      toast.success("Bio data saved successfully");
    } catch (error) {
      toast.error("Failed to save bio data");
      console.error("Error saving bio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(bioData || {});
    setIsEditing(false);
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
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Input
                  value={formData.tag || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tag: e.target.value })
                  }
                  placeholder="e.g., Native Arabic Speaker & Cultural Expert"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description about yourself"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Image URL</label>
              <Input
                value={formData.img || ""}
                onChange={(e) =>
                  setFormData({ ...formData, img: e.target.value })
                }
                placeholder="https://example.com/profile-image.jpg"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Students</label>
                <Input
                  type="number"
                  value={formData.totalStudent || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalStudent: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="4.9"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Years</label>
                <Input
                  type="number"
                  value={formData.experienceYears || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="8"
                />
              </div>
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
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">Name</h3>
                <p className="text-gray-600">{bioData.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tag</h3>
                <p className="text-gray-600">{bioData.tag}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600">{bioData.description}</p>
            </div>

            {bioData.img && (
              <div>
                <h3 className="font-medium text-gray-900">Profile Image</h3>
                <div className="mt-2">
                  <img
                    src={bioData.img}
                    alt={bioData.name}
                    className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {bioData.totalStudent}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bioData.rating}★
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bioData.experienceYears}+
                </div>
                <div className="text-sm text-gray-600">Experience Years</div>
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
