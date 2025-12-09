// Admin API Client with Authentication Support

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AdminApiError {
    success: false;
    error: string;
}

export class AdminApiClient {
    private baseUrl: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;

        // Load tokens from localStorage if available (client-side only)
        if (typeof window !== "undefined") {
            this.accessToken = localStorage.getItem("admin_access_token");
            this.refreshToken = localStorage.getItem("admin_refresh_token");
        }
    }

    /**
     * Set the access token for authenticated requests
     */
    setAccessToken(token: string | null): void {
        this.accessToken = token;

        if (typeof window !== "undefined") {
            if (token) {
                localStorage.setItem("admin_access_token", token);
            } else {
                localStorage.removeItem("admin_access_token");
            }
        }
    }

    /**
     * Set the refresh token
     */
    setRefreshToken(token: string | null): void {
        this.refreshToken = token;

        if (typeof window !== "undefined") {
            if (token) {
                localStorage.setItem("admin_refresh_token", token);
            } else {
                localStorage.removeItem("admin_refresh_token");
            }
        }
    }

    /**
     * Get the current refresh token
     */
    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    /**
     * Get the current access token
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

    /**
     * Clear authentication
     */
    clearAuth(): void {
        this.setAccessToken(null);
        this.setRefreshToken(null);
    }

    /**
     * Make an authenticated API request
     */
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Merge existing headers
        if (options?.headers) {
            const existingHeaders = new Headers(options.headers);
            existingHeaders.forEach((value, key) => {
                headers[key] = value;
            });
        }

        // Add Authorization header if token exists
        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 Unauthorized - throw error but don't clear auth immediately
            // This allows the auth provider to handle the redirect properly
            if (response.status === 401) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: "Unauthorized",
                }));
                const authError = new Error(error.error || "Unauthorized");
                (authError as any).isAuthError = true;
                (authError as any).statusCode = 401;
                throw authError;
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: "Forbidden - Admin access required",
                }));
                throw new Error(error.error || "Forbidden - Admin access required");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }));

                const errorMessage = error.error || `HTTP ${response.status}`;
                console.error(`[Admin API Client] Error response from ${url}:`, error);
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            console.error(`[Admin API Client] Request failed to ${url}:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * POST request with FormData (for file uploads)
     */
    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {};

        // Add Authorization header if token exists
        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        // Note: Do NOT set Content-Type for FormData - browser will set it with boundary

        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: formData,
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: "Unauthorized",
                }));
                const authError = new Error(error.error || "Unauthorized");
                (authError as any).isAuthError = true;
                (authError as any).statusCode = 401;
                throw authError;
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: "Forbidden - Admin access required",
                }));
                throw new Error(error.error || "Forbidden - Admin access required");
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }));

                const errorMessage = error.error || `HTTP ${response.status}`;
                console.error(`[Admin API Client] Error response from ${url}:`, error);
                throw new Error(errorMessage);
            }

            return response.json();
        } catch (error) {
            console.error(`[Admin API Client] Request failed to ${url}:`, error);
            throw error;
        }
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Singleton instance
export const adminApiClient = new AdminApiClient();
