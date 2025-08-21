import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = Date.now();
    const url = `${EXTERNAL_API_BASE_URL}/api/bios?_t=${timestamp}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      cache: 'no-store', // Disable Next.js caching
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch bios: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bios:", error);
    return NextResponse.json(
      { error: "Failed to fetch bios" },
      { status: 500 },
    );
  }
}
