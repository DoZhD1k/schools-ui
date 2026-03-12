"use client";

import React from "react";
import { useAuth } from "../../contexts/auth-context"; // оставляй свой путь

// Описываем минимальную форму того, что нам реально нужно из контекста
type AuthLike = {
  isAuthenticated?: boolean;
  loading?: boolean;
  isLoading?: boolean;
  isAuthLoading?: boolean;
};

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>,
) {
  const ComponentWithAuth: React.FC<P> = (props) => {
    // ❗️БЕЗ any — просто приводим к нашему безопасному типу
    const auth = useAuth() as AuthLike;

    const loading =
        !!auth?.loading ||
        !!auth?.isLoading ||
        !!auth?.isAuthLoading ||
        false;

    if (loading) return <div>Loading...</div>;

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${
      WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
}
