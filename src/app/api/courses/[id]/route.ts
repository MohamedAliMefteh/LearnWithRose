import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses/${id}`, {
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the Authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the auth token from the httpOnly cookie
    const authToken = request.cookies.get('auth_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the Authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses/${id}`, {
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
