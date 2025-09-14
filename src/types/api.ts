// Course-related types
export interface Course {
  id: string | number;
  title: string;
  description: string;
  accent: string;
  level: string;
  duration: string;
  price: string; // string per backend
  students: string; // string per backend
  rating: number;
  image: string | number[] | null; // image as byte data, base64 string, or URL from backend
  thumbnail: string | number[] | null; // thumbnail as byte data, base64 string, or URL from backend
  order: number;
}

export interface CourseSearchParams {
  title?: string;
  level?: string;
  accent?: string;
}

// Authentication types
export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
}

// Testimonial types
export interface Testimonial {
  id: string | number;
  name: string;
  rating: number;
  comment: string;
  course?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  approved?: boolean;
}

export interface CreateTestimonialRequest {
  name: string;
  rating: number;
  comment: string;
  course?: string;
}

// Library Item types
export interface LibraryItem {
  id: string | number;
  title: string;
  description: string;
  type: "pdf" | "audio" | "video" | "document";
  url: string;
  size?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLibraryItemRequest {
  title: string;
  description: string;
  type: "pdf" | "audio" | "video" | "document";
  url: string;
  size?: string;
  category?: string;
}

// Inquiry types
export interface Inquiry {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  course?: string;
  experience?: string;
  createdAt?: string;
  status?: "pending" | "responded" | "closed";
}

export interface CreateInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  course?: string;
  experience?: string;
}

// Updated DigitalResource interface to match backend API structure
export interface DigitalResource {
  id: number;
  title: string;
  description: string;
  category: string;
  fileType: string;
  filePath: string;
  externalUrl: string;
  accent: string;
  level: string;
  thumbnail: string | number[] | null; // thumbnail as byte data, base64 string, or URL from backend
  amount: number; // price amount from backend
  price?: string; // optional formatted price for display in cards (derived from amount)
}

export interface Review {
  id: number;
  name: string;
  accent: string;
  content: string;
  rating: number;
  profileImage: string;
  courseName: string;
  approved?: boolean;
}

export interface BioData {
  heroSection: {
    title: string;
    description: string;
    tag: string;
    stats: {
      studentsTaught: string;
      averageRating: string;
      yearsExperience: string;
    };
  };
  meetYourTeacher: Array<{
    title: string;
    description: string;
  }>;
}

// Legacy BioData interface for backward compatibility
export interface LegacyBioData {
  id: string;
  name: string;
  title: string;
  description: string;
  experience: string;
  totalStudents: number;
  averageRating: number;
  yearsExperience: number;
  profileImage?: string;
  badges: {
    certified: boolean;
    culturalAmbassador: boolean;
    personalizedApproach: boolean;
  };
}

// Blog types - Updated to match v2 API response structure
export interface BlogPost {
  id: number;
  title: string;
  description: string; // v2 API uses 'description' instead of 'excerpt'
  content: string;
  author: string;
  image: string | number[] | null; // v2 API image field as byte data, base64, or URL
  thumbnail: string | number[] | null; // v2 API thumbnail field as byte data, base64, or URL
  // Legacy fields for backward compatibility
  createdDate?: string;
  created?: string;
  created_at?: string;
  featuredImage?: string; // Legacy field, will map to 'image' or 'thumbnail'
  excerpt?: string; // Legacy field, will map to 'description'
  tags?: string[]; // Legacy field
  published?: boolean; // Legacy field
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  status?: number;
}
