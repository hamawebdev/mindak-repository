import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth/auth-store";
import { adminApiClient } from "@/lib/api/admin-client";
import { getCurrentUser } from "@/lib/api/admin/auth";

/**
 * Hook to check authentication status and redirect if not authenticated
 * Use this in protected admin pages
 */
export function useRequireAuth() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current) return;

        // Check if token exists in the API client
        const hasToken = adminApiClient.isAuthenticated();

        if (!hasToken || !isAuthenticated) {
            hasRedirected.current = true;
            router.push("/auth/v1/login");
        }
    }, [isAuthenticated, router]);

    return { isAuthenticated, user };
}

/**
 * Hook to check if user has admin role
 */
export function useRequireAdmin() {
    const router = useRouter();
    const { isAuthenticated, user, setUser, logout } = useAuthStore();
    const hasRedirected = useRef(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current) return;

        const hasToken = adminApiClient.isAuthenticated();

        // If we have a token but no user in store, verify auth with backend
        if (hasToken && !user && !isInitialized) {
            getCurrentUser()
                .then((userData) => {
                    setUser(userData);
                    setIsInitialized(true);
                })
                .catch(() => {
                    // Token is invalid, clear auth and redirect
                    logout();
                    adminApiClient.clearAuth();
                    hasRedirected.current = true;
                    router.push("/auth/v1/login");
                });
            return;
        }

        // Mark as initialized if no token or user already exists
        if (!hasToken || user) {
            setIsInitialized(true);
        }

        // Only redirect after initialization
        if (!isInitialized) return;

        if (!hasToken || !isAuthenticated) {
            hasRedirected.current = true;
            router.push("/auth/v1/login");
            return;
        }

        if (user && user.role !== "admin") {
            hasRedirected.current = true;
            router.push("/unauthorized");
        }
    }, [isAuthenticated, user, router, isInitialized, setUser, logout]);

    return { isAuthenticated, user, isInitialized };
}

/**
 * Hook to get current authentication state without redirecting
 */
export function useAuth() {
    const { isAuthenticated, user, isLoading, error } = useAuthStore();

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        hasToken: adminApiClient.isAuthenticated(),
    };
}
