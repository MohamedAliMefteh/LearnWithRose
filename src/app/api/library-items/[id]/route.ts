export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const authToken = request.cookies.get('auth_token')?.value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/library-items/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!response.ok) {
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/library-items/${id}`, {
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

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/library-items/${id}`, {
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
