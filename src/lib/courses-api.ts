import { Course } from '@/types/api';
import { getCourses as getLocalCourses, addCourse as addLocalCourse, updateCourse as updateLocalCourse, deleteCourse as deleteLocalCourse } from './courses-data';

// Use Next.js API routes to proxy external API calls
const API_BASE_URL = '/api';

// Helper function to get auth token from context or cookies
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // The token is now stored in httpOnly cookies and handled automatically by the browser
  // No need to manually add Authorization header for cookie-based auth
  return headers;
};

// API service for courses using the real backend
export const coursesAPI = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Failed to fetch courses from API, falling back to local data:', error);
      // Fallback to local data when API fails
      return getLocalCourses();
    }
  },

  // Create a new course (requires authentication)
  create: async (course: Omit<Course, 'id'>): Promise<Course> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(course),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required to create courses');
        }

        // Get error details from response
        let errorMessage = `Failed to create course: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If we can't parse error response, use the status text
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create course via API:', error);
      throw error;
    }
  },

  // Update an existing course (requires authentication)
  update: async (id: string | number, course: Partial<Course>): Promise<Course> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(course),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required to update courses');
        }
        throw new Error(`Failed to update course: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update course via API:', error);
      // Don't use fallback for production - throw the error so user gets proper feedback
      throw error;
    }
  },

  // Delete a course (requires authentication)
  delete: async (id: string | number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required to delete courses');
        }
        throw new Error(`Failed to delete course: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete course via API:', error);
      // Don't use fallback for production - throw the error so user gets proper feedback
      throw error;
    }
  },
};
