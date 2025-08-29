import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Prefer server-only env var, with fallback to public one if that is how it's configured
const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

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

async function fetchWithFallback(input: RequestInfo | URL, init?: RequestInit) {
  // Try new 'articles' endpoint first; on 404 or network error, try legacy 'blog' and 'blogs' endpoints for compatibility
  const url = input.toString();
  try {
    const res1 = await fetch(url, init);
    if (res1.ok || res1.status !== 404) return res1;
  } catch {/* ignore and try legacy endpoints */}

  // Try legacy singular /api/blog
  try {
    const legacySingular = url.replace(/\/api\/articles(\b|$)/, '/api/blog$1');
    const res2 = await fetch(legacySingular, init);
    if (res2.ok || res2.status !== 404) return res2;
  } catch {/* ignore and try plural legacy */}

  // Try legacy plural /api/blogs
  try {
    const legacyPlural = url.replace(/\/api\/articles(\b|$)/, '/api/blogs$1');
    const res3 = await fetch(legacyPlural, init);
    return res3;
  } catch (e) {
    throw e;
  }
}

export async function GET(request: Request) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      // Without external API, return an empty list so UI can render gracefully
      return NextResponse.json([]);
    }

    const apiUrl = `${EXTERNAL_API_BASE_URL}/api/articles`;
    const response = await fetchWithFallback(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      let backend: any = null;
      let details: any = `HTTP ${response.status} ${response.statusText}`;
      if (contentType.includes('application/json')) {
        try { backend = await response.json(); } catch { /* ignore */ }
      } else {
        try { details = await response.text(); } catch { /* ignore */ }
      }

      return NextResponse.json(
        { error: 'Failed to fetch blogs', details, backend },
        { status: response.status }
      );
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch {
        return new NextResponse(null, { status: response.status });
      }
    } else {
      try {
        const text = await response.text();
        if (text) {
          return NextResponse.json({ message: text }, { status: response.status });
        }
      } catch { /* ignore */ }
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch blogs', details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    if (!EXTERNAL_API_BASE_URL) {
      // No external API configured; indicate action isn't available yet
      return NextResponse.json(
        { error: 'Blog creation not configured on this server' },
        { status: 501 }
      );
    }

    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required - please log in' },
        { status: 401 }
      );
    }

    const apiUrl = `${EXTERNAL_API_BASE_URL}/api/articles`;
    const response = await fetchWithFallback(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      let backend: any = null;
      let details: any = `HTTP ${response.status} ${response.statusText}`;
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

      return NextResponse.json(
        { error: 'Failed to create blog', details, backend },
        { status: response.status }
      );
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch {
        return new NextResponse(null, { status: response.status });
      }
    } else {
      try {
        const text = await response.text();
        if (text) {
          return NextResponse.json({ message: text }, { status: response.status });
        }
      } catch {/* ignore */}
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create blog', details: message },
      { status: 500 }
    );
  }
}
