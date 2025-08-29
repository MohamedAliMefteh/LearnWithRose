import { apiClient } from './api-client';
import { BlogPost } from '@/types/api';

// Blogs API client following the same pattern as other APIs
export const blogsAPI = {
  // Fetch all blogs (public)
  async getAll(): Promise<BlogPost[]> {
    try {
      const data = await apiClient.get<any[]>('/api/blog', { requireAuth: false });
      const normalized: BlogPost[] = Array.isArray(data)
        ? data.map((d: any, idx: number) => ({
            id: d.id ?? idx,
            title: d.title ?? '',
            content: d.content ?? '',
            author: d.author ?? '',
            createdDate: d.createdDate ?? d.created ?? d.created_at ?? d['created date'],
          }))
        : [];
      return normalized;
    } catch (error) {
      console.error('Failed to fetch blogs from API:', error);
      throw error;
    }
  },

  // Create a blog (auth required)
  async create(payload: Omit<BlogPost, 'id' | 'createdDate' | 'created' | 'created_at'>): Promise<BlogPost> {
    try {
      const created = await apiClient.post<any>('/api/blog', payload, { requireAuth: true });
      // Normalize response to BlogPost
      const normalized: BlogPost = {
        id: created.id,
        title: created.title ?? payload.title,
        content: created.content ?? payload.content,
        author: created.author ?? payload.author,
        createdDate: created.createdDate ?? created.created ?? created.created_at ?? created['created date'],
      };
      return normalized;
    } catch (error) {
      console.error('Failed to create blog via API:', error);
      throw error;
    }
  },

  // Update a blog (auth required)
  async update(id: string | number, payload: Partial<Pick<BlogPost, 'title' | 'content' | 'author'>>): Promise<BlogPost> {
    try {
      const updated = await apiClient.put<any>(`/api/blog/${id}`, payload, { requireAuth: true });
      const normalized: BlogPost = {
        id: updated.id ?? id,
        title: updated.title ?? payload.title ?? '',
        content: updated.content ?? payload.content ?? '',
        author: updated.author ?? payload.author ?? '',
        createdDate: updated.createdDate ?? updated.created ?? updated.created_at ?? updated['created date'],
      };
      return normalized;
    } catch (error) {
      console.error('Failed to update blog via API:', error);
      throw error;
    }
  },

  // Delete a blog (auth required)
  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/api/blog/${id}`, { requireAuth: true });
    } catch (error) {
      console.error('Failed to delete blog via API:', error);
      throw error;
    }
  },
};
