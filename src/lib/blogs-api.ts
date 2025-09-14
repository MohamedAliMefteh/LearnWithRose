import { apiClient } from './api-client';
import { BlogPost } from '@/types/api';

// Blogs API client following the same pattern as other APIs
export const blogsAPI = {
  // Fetch all blogs from v2 API (public)
  async getAll(): Promise<BlogPost[]> {
    try {
      const data = await apiClient.get<any[]>('/api/v2/articles', { requireAuth: false });
      const normalized: BlogPost[] = Array.isArray(data)
        ? data.map((d: any, idx: number) => ({
            id: d.id ?? idx,
            title: d.title ?? '',
            description: d.description ?? '', // v2 API field
            content: d.content ?? '',
            author: d.author ?? '',
            image: d.image ?? null, // v2 API field
            thumbnail: d.thumbnail ?? null, // v2 API field
            // Legacy compatibility
            createdDate: d.createdDate ?? d.created ?? d.created_at ?? d['created date'],
            featuredImage: d.image ?? d.thumbnail, // Map v2 fields to legacy
            excerpt: d.description, // Map v2 description to legacy excerpt
          }))
        : [];
      return normalized;
    } catch (error) {
      console.error('Failed to fetch blogs from v2 API:', error);
      throw error;
    }
  },

  // Fetch a single blog by ID from v2 API (public)
  async getById(id: string | number): Promise<BlogPost> {
    try {
      const data = await apiClient.get<any>(`/api/v2/articles/${id}`, { requireAuth: false });
      const normalized: BlogPost = {
        id: data.id ?? id,
        title: data.title ?? '',
        description: data.description ?? '', // v2 API field
        content: data.content ?? '',
        author: data.author ?? '',
        image: data.image ?? null, // v2 API field
        thumbnail: data.thumbnail ?? null, // v2 API field (base64 encoded)
        // Legacy compatibility
        createdDate: data.createdDate ?? data.created ?? data.created_at ?? data['created date'],
        featuredImage: data.image ?? data.thumbnail, // Map v2 fields to legacy
        excerpt: data.description, // Map v2 description to legacy excerpt
      };
      return normalized;
    } catch (error) {
      console.error(`Failed to fetch blog ${id} from v2 API:`, error);
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
        description: created.description ?? payload.description ?? '',
        content: created.content ?? payload.content,
        author: created.author ?? payload.author,
        image: created.image ?? payload.image ?? null,
        thumbnail: created.thumbnail ?? payload.thumbnail ?? null,
        createdDate: created.createdDate ?? created.created ?? created.created_at ?? created['created date'],
      };
      return normalized;
    } catch (error) {
      console.error('Failed to create blog via API:', error);
      throw error;
    }
  },

  // Update a blog (auth required)
  async update(id: string | number, payload: Partial<Pick<BlogPost, 'title' | 'content' | 'author' | 'featuredImage' | 'excerpt' | 'published'>>): Promise<BlogPost> {
    try {
      const updated = await apiClient.put<any>(`/api/blog/${id}`, payload, { requireAuth: true });
      const normalized: BlogPost = {
        id: updated.id ?? id,
        title: updated.title ?? payload.title ?? '',
        description: updated.description ?? payload.excerpt ?? '',
        content: updated.content ?? payload.content ?? '',
        author: updated.author ?? payload.author ?? '',
        image: updated.image ?? payload.featuredImage ?? null,
        thumbnail: updated.thumbnail ?? null,
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
