import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Blog deletion not configured on this server' },
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

    // Try new articles endpoint first, then legacy singular/plural blog endpoints
    const baseUrl = `${EXTERNAL_API_BASE_URL}/api/articles/${encodeURIComponent(id)}`;
    const response = await fetch(baseUrl, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    }).catch(async () => {
      // On 404 or network error try legacy singular endpoint
      const legacySingular = `${EXTERNAL_API_BASE_URL}/api/blog/${encodeURIComponent(id)}`;
      const resLegacy = await fetch(legacySingular, {
        method: 'DELETE',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (resLegacy.ok || resLegacy.status !== 404) return resLegacy;
      // Try legacy plural endpoint
      const legacyPlural = `${EXTERNAL_API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`;
      return await fetch(legacyPlural, {
        method: 'DELETE',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let backend: any = null;
      let details: any = `HTTP ${response.status} ${response.statusText}`;
      if (contentType.includes('application/json')) {
        try { backend = await response.json(); } catch { /* ignore */ }
      } else {
        try { details = await response.text(); } catch { /* ignore */ }
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required', details, backend },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to delete blog', details, backend },
        { status: response.status }
      );
    }

    // 204 or success with body
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch {
        return new NextResponse(null, { status: response.status });
      }
    } else {
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete blog', details: message },
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

    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: 'Blog update not configured on this server' },
        { status: 501 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required - please log in' },
        { status: 401 }
      );
    }

    const baseUrl = `${EXTERNAL_API_BASE_URL}/api/articles/${encodeURIComponent(id)}`;
    const response = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).catch(async () => {
      // Try legacy singular endpoint
      const legacySingular = `${EXTERNAL_API_BASE_URL}/api/blog/${encodeURIComponent(id)}`;
      const resLegacy = await fetch(legacySingular, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (resLegacy.ok || resLegacy.status !== 404) return resLegacy;
      // Try legacy plural endpoint
      const legacyPlural = `${EXTERNAL_API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`;
      return await fetch(legacyPlural, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
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

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required', details, backend },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update blog', details, backend },
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
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update blog', details: message },
      { status: 500 }
    );
  }
}
