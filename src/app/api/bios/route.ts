import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/bios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
