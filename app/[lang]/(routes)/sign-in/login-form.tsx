"use client";

import { useEffect, JSX } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { LoginFormProps } from "@/types/dictionary";
import { LoadingSpinner } from "@/components/loading-spinner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LoginForm(_props: LoginFormProps): JSX.Element {
  const params = useParams();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Если уже авторизован — перенаправляем на dashboard
  // Если не авторизован и не loading — сразу запускаем Keycloak login
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      const lang = (params.lang as string) || "ru";
      window.location.href = `/${lang}/dashboard`;
      return;
    }

    // Не авторизован → сразу отправляем на Keycloak
    const lang = (params.lang as string) || "ru";
    login(`/${lang}/dashboard`);
  }, [isAuthenticated, isLoading, params.lang, login]);

  // Показываем загрузку — пользователь будет перенаправлен на Keycloak
  return (
    <div className="flex flex-col justify-center items-center min-h-[100dvh] gap-4">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground">
        Перенаправление на страницу авторизации...
      </p>
    </div>
  );
}
