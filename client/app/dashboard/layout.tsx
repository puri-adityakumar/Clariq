"use client";

import { useAuth } from "@/appwrite/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If finished loading and no user, redirect to signin
    if (!loading && !user) {
      router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if no user
  if (!user) {
    return null;
  }

  return (
    <>
      {pathname !== '/dashboard' && (
        <div className="container max-w-7xl py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard"> Return to Dashboard</Link>
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
