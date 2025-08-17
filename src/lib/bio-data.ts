import { BioData } from '@/types/api';

// Minimal placeholder data for initial load
// In production, real data should be loaded from backend API
export const initialBioData: BioData = {
  id: "bio-1",
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

export function getBioData(): BioData {
  return bioData;
}

export function updateBioData(updates: Partial<BioData>): BioData {
  bioData = { ...bioData, ...updates };
  return bioData;
}
