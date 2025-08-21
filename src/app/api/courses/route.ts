import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses from external API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses from external API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the auth token from the httpOnly cookie or Authorization header
    let authToken = request.cookies.get('auth_token')?.value;

    // Fallback to Authorization header if cookie is not present
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }

    console.log('Course creation attempt:');
    console.log('- Auth token from cookie:', !!request.cookies.get('auth_token')?.value);
    console.log('- Auth token from header:', !!request.headers.get('Authorization'));
    console.log('- Final auth token present:', !!authToken);
    console.log('- Request body keys:', Object.keys(body));

    // Validate auth token before making request
    if (!authToken) {
      console.log('- No auth token available, rejecting request');
      return NextResponse.json(
        { error: 'Authentication required - please log in first' },
        { status: 401 }
      );
    }

    // Validate token structure and expiration
    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      console.log('- Token expiry:', new Date(payload.exp * 1000));
      console.log('- Token subject:', payload.sub);
      console.log('- Current time:', new Date());

      if (payload.exp && payload.exp < now) {
        console.log('- Token has expired');
        return NextResponse.json(
          { error: 'Token expired - please log in again' },
          { status: 401 }
        );
      }
    } catch (e) {
      console.log('- Could not decode or validate token:', e);
      return NextResponse.json(
        { error: 'Invalid authentication token - please log in again' },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 second timeout
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

      console.log('Backend course creation failed:');
      console.log('- Status:', response.status);
      console.log('- Error data:', errorData);
      console.log('- Auth header sent:', headers['Authorization'] ? 'Yes (Bearer token)' : 'No');

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required - please log in again', details: errorMessage },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'Access denied - insufficient permissions to create courses',
            details: errorMessage,
            suggestion: 'Please check that your account has the necessary permissions to create courses'
          },
          { status: 403 }
        );
      }

      if (response.status === 500) {
        return NextResponse.json(
          {
            error: 'Backend service error',
            details: 'The backend service is experiencing issues. Please try again later.',
            techDetails: errorMessage
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to create course',
          details: errorMessage,
          status: response.status,
          backendError: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating course via external API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create course via external API',
        details: errorMessage,
        type: 'network_error'
      },
      { status: 500 }
    );
  }
}
