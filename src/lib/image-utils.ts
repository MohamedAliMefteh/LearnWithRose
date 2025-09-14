/**
 * Image utility functions for handling URLs, validation, construction,
 * and byte data conversion across blog posts and library items
 */

/**
 * Constructs a full image URL from a relative or absolute path
 * @param imagePath - The image path from backend (relative or absolute)
 * @param fallbackImage - Default image to use if path is invalid
 * @returns Full image URL
 */
export function constructImageUrl(
  imagePath?: string | null, 
  fallbackImage: string = "/placeholdercourse.jpg"
): string {
  if (!imagePath?.trim()) {
    return fallbackImage;
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, construct full URL with backend base
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  
  // Ensure path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Converts byte data (from backend) to a displayable image URL
 * @param thumbnailData - Byte data, base64 string, URL, or null
 * @param fallbackImage - Fallback image to use if conversion fails
 * @returns Displayable image URL (data URL or regular URL)
 */
export function convertByteDataToImageUrl(
  thumbnailData: string | number[] | null | undefined,
  fallbackImage: string = "/placeholdercourse.jpg"
): string {
  if (!thumbnailData) {
    return fallbackImage;
  }
  
  // If thumbnail is byte data (base64 or array), convert it
  if (typeof thumbnailData === 'string') {
    // Check if it's already a data URL
    if (thumbnailData.startsWith('data:')) {
      return thumbnailData;
    }
    // Check if it's base64 data without prefix
    if (thumbnailData.length > 100 && !thumbnailData.startsWith('http')) {
      return `data:image/jpeg;base64,${thumbnailData}`;
    }
    // If it's a regular URL, use constructImageUrl
    return constructImageUrl(thumbnailData, fallbackImage);
  }
  
  // If it's an array of bytes, convert to base64
  if (Array.isArray(thumbnailData)) {
    try {
      const uint8Array = new Uint8Array(thumbnailData);
      const base64String = btoa(String.fromCharCode(...uint8Array));
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      console.error('Error converting byte array to base64:', error);
      return fallbackImage;
    }
  }
  
  return fallbackImage;
}

/**
 * Validates if an image URL is accessible
 * @param imageUrl - The image URL to validate
 * @returns Promise<boolean> - True if image is accessible
 */
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Gets the appropriate fallback image based on content type
 * @param contentType - Type of content ('blog', 'library', 'course', etc.)
 * @returns Fallback image path
 */
export function getFallbackImage(contentType: 'blog' | 'library' | 'course' | 'default' = 'default'): string {
  switch (contentType) {
    case 'blog':
      return '/blog-placeholder.jpg';
    case 'library':
      return '/placeholdercourse.jpg';
    case 'course':
      return '/placeholdercourse.jpg';
    default:
      return '/placeholdercourse.jpg';
  }
}

/**
 * Extracts the first image URL from HTML content (for blog posts)
 * @param htmlContent - HTML content to search
 * @returns First image URL found or null
 */
export function extractFirstImageFromContent(htmlContent?: string): string | null {
  if (!htmlContent) return null;
  
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = htmlContent.match(imgRegex);
  
  return match ? match[1] : null;
}

/**
 * Generates a responsive image srcSet for different screen sizes
 * @param baseUrl - Base image URL
 * @param sizes - Array of widths to generate
 * @returns srcSet string for responsive images
 */
export function generateResponsiveImageSrcSet(
  baseUrl: string, 
  sizes: number[] = [320, 640, 960, 1280]
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Optimizes image URL for specific dimensions
 * @param imageUrl - Original image URL
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function optimizeImageUrl(
  imageUrl: string, 
  width: number, 
  height?: number, 
  quality: number = 75
): string {
  if (!imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const url = new URL(imageUrl);
  url.searchParams.set('w', width.toString());
  if (height) {
    url.searchParams.set('h', height.toString());
  }
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
}
