import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const allCookies = request.cookies.getAll();
    const authToken = request.cookies.get('auth_token');

    return NextResponse.json({
      hasAuthToken: !!authToken,
      authTokenValue: authToken?.value ? 'present' : 'missing',
      allCookieNames: allCookies.map(cookie => cookie.name),
      cookieCount: allCookies.length,
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    });
  } catch (error) {
    console.error('Error checking cookies:', error);
    return NextResponse.json(
      { error: 'Failed to check cookies' },
      { status: 500 }
    );
  }
}
