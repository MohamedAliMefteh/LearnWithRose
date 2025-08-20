import { NextRequest, NextResponse } from 'next/server';
const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request) {
  try {
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
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch inquiries: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const apiUrl = `${EXTERNAL_API_BASE_URL}/api/inquiries`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to create inquiry: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
