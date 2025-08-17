import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const { level } = params;

    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v1/courses/level/${level}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses by level: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses by level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses by level' },
      { status: 500 }
    );
  }
}
