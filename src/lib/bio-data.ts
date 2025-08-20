import { LegacyBioData } from '@/types/api';

// DEPRECATED: This file is deprecated. Use bioAPI.get() instead.
// Kept for backward compatibility only.

// Minimal placeholder data for initial load
// In production, real data should be loaded from backend API via bioAPI.get()
export const initialBioData: LegacyBioData = {
  id: 1,
  name: "ROSE",
  title: "Native Arabic Speaker & Cultural Expert",
  description: "Authentic Arabic language instruction with cultural insights.",
  experience: "Specialized training in dialect instruction and cultural immersion techniques.",
  totalStudents: 0,
  averageRating: 0,
  yearsExperience: 0,
  profileImage: "/placeholder.svg",
  badges: {
    certified: false,
    culturalAmbassador: false,
    personalizedApproach: false,
  },
};

// In a real app, this would be connected to a database or API
let bioData = { ...initialBioData };

export function getBioData(): LegacyBioData {
  return bioData;
}

export function updateBioData(updates: Partial<LegacyBioData>): LegacyBioData {
  bioData = { ...bioData, ...updates };
  return bioData;
}
