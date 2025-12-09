/**
 * API Error Handler Utility
 * Provides consistent error handling for API calls
 */

export interface ApiError extends Error {
  isAuthError?: boolean;
  statusCode?: number;
}

export function isAuthError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    ((error as ApiError).isAuthError === true || (error as ApiError).statusCode === 401)
  );
}

export function isForbiddenError(error: unknown): error is ApiError {
  return error instanceof Error && (error as ApiError).statusCode === 403;
}

/**
 * Wrap API calls to handle errors consistently
 * Returns null on auth errors instead of throwing
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  options?: {
    onAuthError?: () => void;
    onForbiddenError?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (isAuthError(error)) {
      options?.onAuthError?.();
      return null;
    }

    if (isForbiddenError(error)) {
      options?.onForbiddenError?.();
      return null;
    }

    if (error instanceof Error) {
      options?.onError?.(error);
    }

    throw error;
  }
}

/**
 * Extract user-friendly error message from error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}
