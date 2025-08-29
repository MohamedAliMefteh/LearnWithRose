// API client utility for making authenticated requests

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const { requireAuth = true, ...requestOptions } = options;

    const config: RequestInit = {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...requestOptions.headers,
      },
    };

    // Include credentials for authenticated requests (to send httpOnly cookies)
    if (requireAuth) {
      // Only include cookies; do not add Authorization header here.
      // Token forwarding is handled explicitly in the server bio PUT route.
      config.credentials = "include";
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, config);

      // Handle authentication errors
      if (response.status === 401 && requireAuth) {
        // Redirect to login if unauthorized
        window.location.href = "/login";
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        let baseMsg = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        const extra = errorData.details || errorData.message || (errorData.backend && (errorData.backend.message || JSON.stringify(errorData.backend))) || '';
        const finalMsg = extra ? `${baseMsg} – ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : baseMsg;
        throw new Error(finalMsg);
      }

      // Successful response parsing
      if (response.status === 204) {
        // No Content
        return undefined as unknown as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        // Attempt to parse JSON; if empty body, return undefined
        try {
          return (await response.json()) as T;
        } catch {
          return undefined as unknown as T;
        }
      }

      // For non-JSON responses, try text; if empty, return undefined
      try {
        const text = await response.text();
        if (text) return text as unknown as T;
        return undefined as unknown as T;
      } catch {
        return undefined as unknown as T;
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Convenience methods
  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export a default instance
export const apiClient = new ApiClient();

// Export the class for custom instances
export default ApiClient;
