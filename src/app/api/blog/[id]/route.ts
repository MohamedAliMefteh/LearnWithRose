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

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

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

    // Try singular and plural delete endpoints
    const baseUrl = `${EXTERNAL_API_BASE_URL}/api/blog/${encodeURIComponent(id)}`;
    const response = await fetch(baseUrl, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    }).catch(async (e) => {
      // On 404 or network error try plural endpoint
      const altUrl = `${EXTERNAL_API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`;
      return await fetch(altUrl, {
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
