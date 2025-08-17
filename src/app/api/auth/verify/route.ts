import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from the httpOnly cookie
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Basic JWT validation (check if it has the right structure)
    try {
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }

      // Return the token for client-side use
      return NextResponse.json({
        jwt: authToken, // Match the backend response structure
        token: authToken, // Also provide as 'token' for compatibility
        authenticated: true,
        user: {
          id: payload.sub || '1',
          name: payload.sub || 'User',
          email: payload.email || ''
        }
      });
    } catch (jwtError) {
      console.error('JWT validation error:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}
