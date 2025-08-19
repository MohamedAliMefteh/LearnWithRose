import { apiClient } from './api-client';
import { BioData } from '@/types/api';

// Bio API client for fetching teacher's bio data
export const bioAPI = {
  // Get bio data from the backend
  async get(): Promise<BioData | null> {
    try {
      const response = await apiClient.get<BioData | BioData[]>('/api/bios', { requireAuth: false });

      // Handle both single object and array responses
      if (Array.isArray(response)) {
        return response.length > 0 ? response[0] : null;
      }

      return response;
    } catch (error) {
      console.warn('Failed to fetch bio data from API:', error);
      return null;
    }
  },

  // Save bio data to the backend
  async save(bioData: Omit<BioData, 'id'> | BioData): Promise<BioData> {
    try {
      return await apiClient.post<BioData>('/api/bios', bioData, { requireAuth: true });
    } catch (error) {
      console.error('Failed to save bio data to API:', error);
      throw error;
    }
  },
};
