import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = Date.now();
    const url = `${EXTERNAL_API_BASE_URL}/api/bios?_t=${timestamp}`;

    console.log(`External API Base URL: ${EXTERNAL_API_BASE_URL}`);
    console.log(`Fetching bio data from: ${url}`);

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
    console.log('Bio data fetched from external API:');
    console.log('- Response status:', response.status);
    console.log('- Data type:', Array.isArray(data) ? 'array' : typeof data);
    console.log('- Data length (if array):', Array.isArray(data) ? data.length : 'not array');
    console.log('- Data structure:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bios:", error);
    return NextResponse.json(
      { error: "Failed to fetch bios" },
      { status: 500 },
    );
  }
}
