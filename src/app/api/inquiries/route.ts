import { NextRequest, NextResponse } from 'next/server';

// Ensure Node.js runtime on Vercel and disable static optimization for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Prefer server-only env var, with fallback to public one if that is how it's configured
const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXT_PUBLIC_API_BASE_URL is not set' },
        { status: 500 }
      );
    }

    // Parse query params for pagination
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '0';
    const size = url.searchParams.get('size') ?? '10';

    // Backend expects a pageable object in query
    const params = new URLSearchParams();
    params.append('pageable', JSON.stringify({ page: Number(page), size: Number(size) }));

    const apiUrl = `${EXTERNAL_API_BASE_URL}/api/inquiries?${params.toString()}`;
    const response = await fetch(apiUrl, {
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
        { error: 'Failed to fetch inquiries', details, backend },
        { status: response.status }
      );
    }

    // Success: prefer JSON, but support empty or text responses gracefully
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
    console.error('Error fetching inquiries:', message);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries', details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Server misconfiguration: NEXT_PUBLIC_API_BASE_URL is not set' },
        { status: 500 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing JSON body' },
        { status: 400 }
      );
    }

    const apiUrl = `${EXTERNAL_API_BASE_URL}/api/inquiries`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
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

      // Forward specific auth errors if any
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required', details, backend },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create inquiry', details, backend },
        { status: response.status }
      );
    }

    // Success. Handle possible empty body or non-JSON response.
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch {
        // JSON expected but not parsable; return success with no body
        return new NextResponse(null, { status: response.status });
      }
    } else {
      // Return plain text or empty
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
    console.error('Error creating inquiry:', message);
    return NextResponse.json(
      { error: 'Failed to create inquiry', details: message },
      { status: 500 }
    );
  }
}
