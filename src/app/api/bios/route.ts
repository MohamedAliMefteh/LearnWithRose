import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/bios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bios: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the auth token from the httpOnly cookie
    const authToken = request.cookies.get('auth_token')?.value;

    console.log('Bio save attempt:');
    console.log('- Auth token present:', !!authToken);
    console.log('- Request body keys:', Object.keys(body));

    if (!authToken) {
      console.log('- No auth token available, rejecting request');
      return NextResponse.json(
        { error: 'Authentication required - please log in first' },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/bios`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMessage = `Backend returned ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If we can't parse error response, use the status text
      }

      console.log('Backend bio save failed:');
      console.log('- Status:', response.status);
      console.log('- Error data:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required - please log in again' },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access denied - insufficient permissions' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to save bio data', details: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving bio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to save bio data', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // For backward compatibility, redirect PUT to POST
  return POST(request);
}
