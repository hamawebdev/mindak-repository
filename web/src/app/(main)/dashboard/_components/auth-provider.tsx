"use client";

import { ReactNode } from "react";

import { useRequireAdmin } from "@/hooks/use-auth";

/**
 * Auth Provider for Dashboard
 * Ensures user is authenticated and has admin role before rendering children
 */
export function DashboardAuthProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user, isInitialized } = useRequireAdmin();

    // Don't render children until auth check is complete
    if (!isInitialized || !isAuthenticated || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="text-muted-foreground animate-pulse">Verifying authentication...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
