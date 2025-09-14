import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/courses/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching course via external API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course via external API' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract metadata from form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const accent = formData.get('accent') as string;
    const level = formData.get('level') as string;
    const duration = formData.get('duration') as string;
    const price = formData.get('price') as string;
    const students = formData.get('students') as string;
    const order = formData.get('order') as string;
    const rating = formData.get('rating') as string;
    
    // Extract thumbnail file
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

    console.log(`Course update attempt for ID ${id}:`);
    console.log('- Auth token from cookie:', !!request.cookies.get('auth_token')?.value);
    console.log('- Auth token from header:', !!request.headers.get('Authorization'));
    console.log('- Final auth token present:', !!authToken);

    // Build query parameters for metadata
    const queryParams = new URLSearchParams();
    if (title) queryParams.append('title', title);
    if (description) queryParams.append('description', description);
    if (accent) queryParams.append('accent', accent);
    if (level) queryParams.append('level', level);
    if (duration) queryParams.append('duration', duration);
    if (price) queryParams.append('price', price);
    if (students) queryParams.append('students', students);
    if (order) queryParams.append('order', order);
    if (rating) queryParams.append('rating', rating);

    // Create new FormData for the backend request
    const backendFormData = new FormData();
    if (thumbnailFile) {
      backendFormData.append('thumbnailFile', thumbnailFile);
    }

    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    // Note: Don't set Content-Type for FormData, let the browser set it with boundary

    const url = `${EXTERNAL_API_BASE_URL}/api/v2/courses/${id}/upload?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: backendFormData,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Failed to update course: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating course via external API:', error);
    return NextResponse.json(
      { error: 'Failed to update course via external API' },
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

    console.log(`Course delete attempt for ID ${id}:`);
    console.log('- Auth token from cookie:', !!request.cookies.get('auth_token')?.value);
    console.log('- Auth token from header:', !!request.headers.get('Authorization'));
    console.log('- Final auth token present:', !!authToken);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the Authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/courses/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to delete course: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course via external API:', error);
    return NextResponse.json(
      { error: 'Failed to delete course via external API' },
      { status: 500 }
    );
  }
}
