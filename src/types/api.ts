// Course-related types
export interface Course {
  id: string | number;
  title: string;
  description: string;
  accent: "palestinian" | "lebanese";
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  price: number;
  students: number;
  rating: number;
  image?: string;
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

// Legacy types for backward compatibility
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
}

export interface Review {
  id: number;
  name: string;
  accent: string;
  content: string;
  rating: number;
  profileImage: string;
  courseName: string;
}

export interface BioData {
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
