import { adminApiClient } from "../admin-client";
import type { AdminApiResponse, AuthResponse, LoginCredentials, RefreshTokenResponse } from "@/types/admin-api";

/**
 * Admin Authentication API
 * 
 * Implements JWT authentication flow as documented in AUTH_DOCUMENTATION.md
 */

/**
 * Login with email and password
 * Returns access token, refresh token, and user information
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await adminApiClient.post<AdminApiResponse<AuthResponse>>(
    "/api/v1/auth/login",
    credentials
  );
  
  // Store both access and refresh tokens in the client
  if (response.data.token) {
    adminApiClient.setAccessToken(response.data.token);
  }
  if (response.data.refreshToken) {
    adminApiClient.setRefreshToken(response.data.refreshToken);
  }
  
  return response.data;
}

/**
 * Logout the current user
 * Revokes refresh tokens and clears local authentication
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint to revoke refresh tokens
    await adminApiClient.post("/api/v1/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local authentication
    adminApiClient.clearAuth();
  }
}

/**
 * Get current authenticated user information
 * Useful for checking authentication status on app load
 */
export async function getCurrentUser(): Promise<AuthResponse["user"]> {
  const response = await adminApiClient.get<AdminApiResponse<AuthResponse["user"]>>(
    "/api/v1/auth/me"
  );
  return response.data;
}

/**
 * Refresh the access token using refresh token
 * Returns new access and refresh tokens
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  const currentRefreshToken = adminApiClient.getRefreshToken();
  
  if (!currentRefreshToken) {
    throw new Error("No refresh token available");
  }
  
  const response = await adminApiClient.post<AdminApiResponse<RefreshTokenResponse>>(
    "/api/v1/auth/refresh",
    { refreshToken: currentRefreshToken }
  );
  
  // Store new tokens
  if (response.data.accessToken) {
    adminApiClient.setAccessToken(response.data.accessToken);
  }
  if (response.data.refreshToken) {
    adminApiClient.setRefreshToken(response.data.refreshToken);
  }
  
  return response.data;
}
