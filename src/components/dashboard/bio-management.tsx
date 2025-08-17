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
import { getBioData, updateBioData } from "@/lib/bio-data";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

export function BioManagement() {
  const [bioData, setBioData] = useState<BioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BioData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBioData();
  }, []);

  const fetchBioData = () => {
    try {
      const data = getBioData();
      setBioData(data);
      setFormData(data);
    } catch (error) {
      toast.error("Failed to load bio data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    try {
      const updatedData = updateBioData(formData);
      setBioData(updatedData);
      setIsEditing(false);
      toast.success("Bio data updated successfully");
    } catch (error) {
      toast.error("Failed to update bio data");
    }
  };

  const handleCancel = () => {
    setFormData(bioData || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return <div>Loading bio data...</div>;
  }

  if (!bioData) {
    return <div>No bio data found</div>;
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
              Edit Bio
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
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Your professional title"
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
              <label className="text-sm font-medium">Experience</label>
              <Textarea
                value={formData.experience || ""}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder="Your professional experience"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Students</label>
                <Input
                  type="number"
                  value={formData.totalStudents || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalStudents: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Average Rating</label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.averageRating || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      averageRating: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="4.9"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Years Experience</label>
                <Input
                  type="number"
                  value={formData.yearsExperience || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsExperience: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="8"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">Name</h3>
                <p className="text-gray-600">{bioData.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Title</h3>
                <p className="text-gray-600">{bioData.title}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600">{bioData.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Experience</h3>
              <p className="text-gray-600">{bioData.experience}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {bioData.totalStudents}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {bioData.averageRating}★
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {bioData.yearsExperience}+
                </div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
