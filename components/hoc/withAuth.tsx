"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context"; // оставляй свой путь

type WithAuthOptions = {
  redirectTo?: string;
};

// Описываем минимальную форму того, что нам реально нужно из контекста
type AuthLike = {
  isAuthenticated?: boolean;
  loading?: boolean;
  isLoading?: boolean;
  isAuthLoading?: boolean;
};

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: WithAuthOptions = {}
) {
  const { redirectTo = "/ru/sign-in" } = options;

  const ComponentWithAuth: React.FC<P> = (props) => {
    // ❗️БЕЗ any — просто приводим к нашему безопасному типу
    const auth = useAuth() as AuthLike;
    const router = useRouter();

    const isAuthenticated = !!auth?.isAuthenticated;

    const loading =
        !!auth?.loading ||
        !!auth?.isLoading ||
        !!auth?.isAuthLoading ||
        false;

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace(redirectTo);
      }
    }, [loading, isAuthenticated, router, redirectTo]);

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${
      WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
}
