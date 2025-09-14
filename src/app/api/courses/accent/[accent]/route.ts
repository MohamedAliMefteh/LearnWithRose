import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ accent: string }> }
) {
  try {
    const { accent } = await context.params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/courses/accent/${accent}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses by accent: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses by accent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses by accent' },
      { status: 500 }
    );
  }
}
