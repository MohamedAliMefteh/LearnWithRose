import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch bios: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bios:", error);
    
    // Return fallback data if backend is unavailable
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      console.log('Backend timeout, returning fallback bio data');
      return NextResponse.json({
        heroSection: {
          title: "Learn Arabic with Rose",
          description: "Professional Arabic teacher with years of experience helping students master the Arabic language",
          tag: "Arabic Language Expert",
          stats: {
            studentsTaught: "500+",
            averageRating: "4.9",
            yearsExperience: "8"
          }
        },
        meetYourTeacher: [
          {
            title: "Experienced Educator",
            description: "Over 8 years of teaching Arabic to students from around the world"
          },
          {
            title: "Cultural Ambassador",
            description: "Bringing Arabic culture and language together in every lesson"
          }
        ]
      });
    }
    
    return NextResponse.json(
      { error: "Failed to fetch bios" },
      { status: 500 },
    );
  }
}
