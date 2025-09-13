import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/testimonials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    
    // Return fallback data if backend is unavailable
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      console.log('Backend timeout, returning fallback testimonials data');
      return NextResponse.json([
        {
          id: 1,
          name: "Sarah Ahmed",
          rating: 5,
          comment: "Rose is an amazing Arabic teacher! Her teaching methods are very effective and engaging.",
          course: "Arabic for Beginners",
          approved: true
        },
        {
          id: 2,
          name: "Mohammed Ali",
          rating: 5,
          comment: "I've learned so much from Rose's courses. Highly recommended for anyone wanting to learn Arabic.",
          course: "Intermediate Arabic",
          approved: true
        }
      ]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the auth token from the httpOnly cookie
    const authToken = request.cookies.get('auth_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward the Authorization header if we have a token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Enforce approved=false by default on creation
    const payload = { ...body, approved: false };

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/testimonials`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to create testimonial: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
