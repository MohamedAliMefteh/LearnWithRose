import { Review } from '@/types/api';

// Minimal fallback data for when API is unavailable
// In production, this should be empty or contain only essential placeholder data
export const initialReviews: Review[] = [];

// In a real app, this would be connected to a database or API
let reviewsData = [...initialReviews];

export function getReviews(): Review[] {
  return reviewsData;
}

export function addReview(review: Omit<Review, "id">): Review {
  const newReview: Review = {
    ...review,
    id: (reviewsData.length + 1).toString(),
  };
  reviewsData.push(newReview);
  return newReview;
}

export function updateReview(id: string, review: Partial<Review>): Review | null {
  const index = reviewsData.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  reviewsData[index] = { ...reviewsData[index], ...review };
  return reviewsData[index];
}

export function deleteReview(id: string): boolean {
  const index = reviewsData.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  reviewsData.splice(index, 1);
  return true;
}
