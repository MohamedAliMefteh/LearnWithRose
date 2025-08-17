import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/testimonials/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch testimonial: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
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

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/testimonials/${id}`, {
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
      throw new Error(`Failed to delete testimonial: ${response.status} ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
