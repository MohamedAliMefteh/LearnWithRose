import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!EXTERNAL_API_BASE_URL) {
      return NextResponse.json(
        { error: "API base URL is not configured" },
        { status: 500 }
      );
    }

    const { orderId } = await context.params;

    const resp = await fetch(`${EXTERNAL_API_BASE_URL}/api/payments/order/${orderId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Failed to get order", status: resp.status, details: data },
        { status: resp.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in get-order proxy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
