"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

// Routes that can be viewed without being logged in
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/safety",
  "/privacy",
  "/terms",
  "/help"
];

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  useEffect(() => {
    if (isLoading) return;

    // 1. If not logged in and on a protected route, redirect to /auth/login
    if (!user && !isPublicRoute) {
      router.replace("/auth/login");
    }

    // 2. If logged in and visiting login or register, redirect to /
    if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
      router.replace("/");
    }
  }, [user, isLoading, isPublicRoute, pathname, router]);

  // While checking auth status on protected pages, show a sleek loading state
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Verifying Student Access...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in and route is protected, don't flash content before redirect
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Redirecting to Student Login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Verifying Student Access...
          </p>
        </div>
      </div>
    }>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
}
