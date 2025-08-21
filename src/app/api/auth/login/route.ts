import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

async function attemptAuthentication(
  body: any,
  retryCount = 0,
): Promise<Response> {
  const maxRetries = 2;

  try {
    const response = await fetch(
      `${EXTERNAL_API_BASE_URL}/api/v1/auth/authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
    );

    // If we get a 500 error and haven't exhausted retries, try again
    if (response.status === 500 && retryCount < maxRetries) {
      console.log(
        `Authentication failed with 500, retrying... (attempt ${retryCount + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return attemptAuthentication(body, retryCount + 1);
    }

    return response;
  } catch (error) {
    // Network errors - retry if we haven't exhausted attempts
    if (retryCount < maxRetries) {
      console.log(
        `Network error during authentication, retrying... (attempt ${retryCount + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return attemptAuthentication(body, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await attemptAuthentication(body);

    if (!response.ok) {
      let errorText = "";
      let errorJson = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson, null, 2);
        } else {
          errorText = await response.text();
        }
      } catch (e) {
        errorText = "Could not parse error response";
      }

      // Log authentication failure
      console.error(
        `Authentication failed: ${response.status} ${response.statusText}`,
      );

      // Return more detailed error messages
      let errorMessage = "Authentication failed";
      if (response.status === 401) {
        errorMessage = "Invalid username or password";
      } else if (response.status === 500) {
        errorMessage =
          "Backend service is experiencing issues. Please try again later.";
      } else if (response.status >= 502 && response.status <= 504) {
        errorMessage = "Backend service is temporarily unavailable";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorJson?.message || errorText,
          status: response.status,
          timestamp: new Date().toISOString(),
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Create a response with the user data
    const nextResponse = NextResponse.json(data);

    // Set the JWT token as a secure, httpOnly cookie
    // Backend returns JWT as "jwt" property
    const token =
      data.jwt || data.token || data.accessToken || data.access_token;
    if (token) {
      nextResponse.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      console.log(
        "Auth token cookie set successfully with value length:",
        token.length,
      );
    } else {
      console.error("No token found in authentication response");
    }

    return nextResponse;
  } catch (error) {
    console.error("Error during authentication via external API:", error);
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
