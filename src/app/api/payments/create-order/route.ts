import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Forward to backend payment create-order
    const resp = await fetch(`${EXTERNAL_API_BASE_URL}/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Failed to create order", status: resp.status, details: data },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in create-order proxy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
