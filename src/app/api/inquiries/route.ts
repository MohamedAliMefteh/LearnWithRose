import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn-with-rose-backend.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let errorData = null;
    if (!response.ok) {
      try {
        errorData = await response.json();
      } catch {
        // ignore JSON parse error
      }
      return NextResponse.json(
        {
          error: 'Failed to create inquiry',
          details: errorData?.message || errorData?.error || response.statusText,
          status: response.status,
          backendError: errorData
        },
        { status: response.status }
      );
    }

    let data = null;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create inquiry',
        details: errorMessage,
        type: 'network_error'
      },
      { status: 500 }
    );
  }
}
