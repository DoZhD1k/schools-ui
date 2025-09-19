"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ComponentType, useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const redirectPath = "/sign-in";

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectPath);
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}
