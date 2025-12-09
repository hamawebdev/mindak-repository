"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth/auth-store";
import { adminApiClient } from "@/lib/api/admin-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 * Wraps admin pages to ensure authentication and authorization
 */
export function ProtectedRoute({
  children,
  requireAdmin = true,
  fallback = <LoadingFallback />,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const hasToken = adminApiClient.isAuthenticated();

      // No token or not authenticated
      if (!hasToken || !isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      // Check admin role if required
      if (requireAdmin && user && user.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, requireAdmin, router]);

  if (isChecking) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Default loading fallback
 */
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Verifying authentication...</p>
      </div>
    </div>
  );
}
