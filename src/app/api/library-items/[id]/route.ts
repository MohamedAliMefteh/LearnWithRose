export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract metadata from form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const fileType = formData.get('fileType') as string;
    const accent = formData.get('accent') as string;
    const level = formData.get('level') as string;
    const amount = formData.get('amount') as string;
    
    // Extract files
    const pdfFile = formData.get('pdfFile') as File | null;
    const thumbnailFile = formData.get('thumbnailFile') as File | null;

    // Get the auth token from the httpOnly cookie or Authorization header
    let authToken = request.cookies.get('auth_token')?.value;

    // Fallback to Authorization header if cookie is not present
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }

    // Build query parameters for metadata
    const queryParams = new URLSearchParams();
    if (title) queryParams.append('title', title);
    if (description) queryParams.append('description', description);
    if (category) queryParams.append('category', category);
    if (fileType) queryParams.append('fileType', fileType);
    if (accent) queryParams.append('accent', accent);
    if (level) queryParams.append('level', level);
    if (amount) queryParams.append('amount', amount);

    // Create new FormData for the backend request
    const backendFormData = new FormData();
    if (pdfFile) {
      backendFormData.append('pdfFile', pdfFile);
    }
    if (thumbnailFile) {
      backendFormData.append('thumbnailFile', thumbnailFile);
    }

    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    // Note: Don't set Content-Type for FormData, let the browser set it with boundary

    const url = `${EXTERNAL_API_BASE_URL}/api/v2/library-items/${id}/upload?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: backendFormData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update library item' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating library item:', error);
    return NextResponse.json(
      { error: 'Failed to update library item' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/library-items/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch library item: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching library item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get the auth token from the httpOnly cookie or Authorization header
    let authToken = request.cookies.get('auth_token')?.value;

    // Fallback to Authorization header if cookie is not present
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the Authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/library-items/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to delete library item: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting library item:', error);
    return NextResponse.json(
      { error: 'Failed to delete library item' },
      { status: 500 }
    );
  }
}
