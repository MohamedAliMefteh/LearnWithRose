import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

type BioPayload = {
  id?: number;
  heroSection?: unknown;
  meetYourTeacher?: unknown;
  // Allow any additional fields the backend may accept
  [key: string]: unknown;
};

function getAuthToken(request: NextRequest): string | null {
  // Primary source: httpOnly cookie set during login
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  // Optional fallback: Authorization header (Bearer <token>) if caller provides it
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function PUT(request: NextRequest) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXT_PUBLIC_API_BASE_URL is not set' },
        { status: 500 }
      );
    }

    let body: BioPayload = {};
    try {
      body = await request.json();
    } catch {
      // If body is missing or invalid JSON
      return NextResponse.json(
        { error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required - please log in' },
        { status: 401 }
      );
    }

    // Backend requires id = 1. We enforce it both in URL and body.
    const forwardBody: BioPayload = { ...body, id: 1 };

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/bios/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(forwardBody),
      // Do not forward cookies to the external API; we use Bearer auth only
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let backend: any = null;
      let details = `HTTP ${response.status} ${response.statusText}`;
      if (contentType.includes('application/json')) {
        try { backend = await response.json(); } catch {/* ignore */}
      } else {
        try { details = await response.text(); } catch {/* ignore */}
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required', details, backend },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access denied - insufficient permissions', details, backend },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update bio data', details, backend },
        { status: response.status }
      );
    }

    // Success: pass through backend JSON
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update bio data', details: message },
      { status: 500 }
    );
  }
}
