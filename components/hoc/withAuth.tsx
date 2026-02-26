"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ComponentType, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading, login } = useAuth();
    const router = useRouter();
    const redirectAttempted = useRef(false);

    useEffect(() => {
      if (!isLoading && !isAuthenticated && !redirectAttempted.current) {
        redirectAttempted.current = true;
        try {
          login(window.location.pathname);
        } catch {
          // Если Keycloak login не сработал — фоллбэк на /sign-in
          const lang = window.location.pathname.split("/")[1] || "ru";
          router.push(`/${lang}/sign-in`);
        }
      }
    }, [isLoading, isAuthenticated, login, router]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}
