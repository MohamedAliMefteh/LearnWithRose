import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE_URL}/api/v2/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch courses: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching courses from external API:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses from external API" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the httpOnly cookie or Authorization header
    let authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        authToken = authHeader.substring(7);
      }
    }

    const contentType = request.headers.get("content-type")?.toLowerCase() || "";

    console.log("Course creation attempt:");
    console.log("- Auth token from cookie:", !!request.cookies.get("auth_token")?.value);
    console.log("- Auth token from header:", !!request.headers.get("Authorization"));
    console.log("- Final auth token present:", !!authToken);
    console.log("- Content-Type:", contentType);

    // Validate auth token before making request
    if (!authToken) {
      console.log("- No auth token available, rejecting request");
      return NextResponse.json(
        { error: "Authentication required - please log in first" },
        { status: 401 },
      );
    }

    // Validate token structure and expiration
    try {
      const parts = authToken.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT structure");
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      console.log("- Token expiry:", new Date(payload.exp * 1000));
      if (payload.exp && payload.exp < now) {
        console.log("- Token has expired");
        return NextResponse.json(
          { error: "Token expired - please log in again" },
          { status: 401 },
        );
      }
    } catch (e) {
      console.log("- Could not decode or validate token:", e);
      return NextResponse.json(
        { error: "Invalid authentication token - please log in again" },
        { status: 401 },
      );
    }

    // Branch: if multipart/form-data, accept file upload directly from client
    if (contentType.includes("multipart/form-data")) {
      const inForm = await request.formData();

      const title = String(inForm.get("title") ?? "");
      const description = String(inForm.get("description") ?? "");
      const accent = String(inForm.get("accent") ?? "");
      const level = String(inForm.get("level") ?? "");
      const duration = String(inForm.get("duration") ?? "");
      const price = String(inForm.get("price") ?? "");
      const students = String(inForm.get("students") ?? "");
      const rating = String(inForm.get("rating") ?? "5");
      const image = String(inForm.get("image") ?? "");
      const order = String(inForm.get("order") ?? "1");

      const file = inForm.get("thumbnailFile") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "thumbnailFile is required" },
          { status: 400 },
        );
      }

      const url = new URL(`${EXTERNAL_API_BASE_URL}/api/v2/courses/upload`);
      url.searchParams.set("title", title);
      url.searchParams.set("description", description);
      url.searchParams.set("accent", accent);
      url.searchParams.set("level", level);
      url.searchParams.set("duration", duration);
      url.searchParams.set("price", price);
      url.searchParams.set("students", students);
      url.searchParams.set("rating", rating);
      url.searchParams.set("image", image);
      url.searchParams.set("order", order);

      const outForm = new FormData();
      outForm.append("thumbnailFile", file, (file as any).name || "thumbnail");

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: outForm,
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        let errorMessage = `Backend returned ${response.status}: ${response.statusText}`;
        let errorData: any = null;
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        return NextResponse.json({ error: "Failed to create course", details: errorMessage, backendError: errorData }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Legacy JSON path: accept JSON and fetch thumbnail URL server-side
    // Read JSON body from client (legacy front-end submits JSON)
    const body = await request.json();
    console.log("- Incoming body keys:", Object.keys(body || {}));

    const title = String(body?.title ?? "");
    const description = String(body?.description ?? "");
    const accent = String(body?.accent ?? "");
    const level = String(body?.level ?? "");
    const duration = String(body?.duration ?? "");
    const price = String(body?.price ?? "");
    const students = String(body?.students ?? "");
    const rating = String(body?.rating ?? "5");
    const image = String(body?.image ?? "");
    const order = String(body?.order ?? "1");

    const thumbnailUrl = String(body?.thumbnail || body?.image || "");
    if (!thumbnailUrl) {
      return NextResponse.json(
        { error: "thumbnail (URL) is required in request body until UI supports file upload" },
        { status: 400 },
      );
    }

    let outForm: FormData;
    try {
      const resolvedUrl = thumbnailUrl.startsWith("http")
        ? thumbnailUrl
        : new URL(thumbnailUrl, request.nextUrl.origin).toString();
      const thumbRes = await fetch(resolvedUrl);
      if (!thumbRes.ok) {
        throw new Error(`Failed to fetch thumbnail from provided URL (${thumbRes.status} ${thumbRes.statusText})`);
      }
      const blob = await thumbRes.blob();
      const urlParts = thumbnailUrl.split("?")[0].split("/");
      const filename = urlParts[urlParts.length - 1] || "thumbnail";
      outForm = new FormData();
      outForm.append("thumbnailFile", blob, filename);
    } catch (e: any) {
      console.error("- Thumbnail fetch/prepare failed:", e?.message || e);
      return NextResponse.json(
        { error: "Failed to retrieve thumbnail image from provided URL", details: String(e?.message || e) },
        { status: 400 },
      );
    }

    const url = new URL(`${EXTERNAL_API_BASE_URL}/api/v2/courses/upload`);
    url.searchParams.set("title", title);
    url.searchParams.set("description", description);
    url.searchParams.set("accent", accent);
    url.searchParams.set("level", level);
    url.searchParams.set("duration", duration);
    url.searchParams.set("price", price);
    url.searchParams.set("students", students);
    url.searchParams.set("rating", rating);
    url.searchParams.set("image", image);
    url.searchParams.set("order", order);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: outForm,
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      let errorMessage = `Backend returned ${response.status}: ${response.statusText}`;
      let errorData: any = null;
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Authentication required - please log in again", details: errorMessage },
          { status: 401 },
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Access denied - insufficient permissions to create courses", details: errorMessage },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create course", details: errorMessage, backendError: errorData },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating course via external API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create course via external API", details: errorMessage, type: "network_error" },
      { status: 500 },
    );
  }
}
