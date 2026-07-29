"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { ROUTES } from "@/constants/routes";
import { isPrivileged, isSuper } from "@/constants/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Requires a privileged user — vendor (admin) OR superadmin. */
  requireAdmin?: boolean;
  /** Requires the platform operator (superadmin) specifically. */
  requireSuperadmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperadmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  // Auth is hydrated from localStorage only on the client (see ReduxProvider),
  // so during SSR and the very first client render it isn't known yet. Gate on
  // `mounted` so both render the loader — otherwise the server (unauthenticated)
  // and client (authenticated) markup differ and React throws a hydration error.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const role = user?.role;
  const lacksAdmin = requireAdmin && !isPrivileged(role);
  const lacksSuper = requireSuperadmin && !isSuper(role);
  const blocked = lacksAdmin || lacksSuper;

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (blocked) {
        // Authenticated but wrong role — send privileged users to their
        // dashboard, everyone else home.
        router.push(isPrivileged(role) ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME);
      }
    }
  }, [mounted, isAuthenticated, isLoading, blocked, role, router]);

  // Show loading spinner until mounted (matches SSR) and while checking auth.
  if (!mounted || isLoading || !isAuthenticated || blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
