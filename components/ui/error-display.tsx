/**
 * Error Boundary Component
 * Компонент для обработки и отображения ошибок
 */

"use client";

import { useState } from "react";
import { AlertTriangle, RefreshCw, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
}

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getErrorTypeAndActions = (status?: number) => {
    switch (status) {
      case 401:
        return {
          title: "Требуется авторизация",
          description: "Ваша сессия истекла или вы не авторизованы",
          icon: LogIn,
          actions: (
            <Button
              onClick={() => router.push("/ru/sign-in")}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Войти в систему
            </Button>
          ),
        };

      case 403:
        return {
          title: "Доступ запрещен",
          description: "У вас нет прав для выполнения этого действия",
          icon: AlertTriangle,
          actions: (
            <Button
              onClick={() => router.push("/ru")}
              variant="outline"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          ),
        };

      case 404:
        return {
          title: "Ресурс не найден",
          description: "Запрашиваемый ресурс не существует или недоступен",
          icon: AlertTriangle,
          actions: (
            <div className="space-y-2">
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isRetrying ? "animate-spin" : ""
                    }`}
                  />
                  Повторить
                </Button>
              )}
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Назад
              </Button>
            </div>
          ),
        };

      case 400:
        return {
          title: "Некорректный запрос",
          description: "Проверьте введенные данные и попробуйте снова",
          icon: AlertTriangle,
          actions: onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
              />
              Повторить
            </Button>
          ),
        };

      default:
        return {
          title: "Произошла ошибка",
          description: "Что-то пошло не так. Попробуйте еще раз",
          icon: AlertTriangle,
          actions: onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
              />
              Повторить
            </Button>
          ),
        };
    }
  };

  const errorInfo = getErrorTypeAndActions(error.status);
  const Icon = errorInfo.icon;

  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Icon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-xl mb-2">{errorInfo.title}</CardTitle>
          <CardDescription className="mb-4">
            {errorInfo.description}
          </CardDescription>

          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>

          {errorInfo.actions}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Компонент для встроенного отображения ошибок (например, в формах)
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = "" }: InlineErrorProps) {
  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Hook для управления состояниями ошибок
 */
export function useErrorHandler() {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = (err: unknown) => {
    console.error("API Error:", err);

    if (err instanceof Error) {
      setError({
        message: err.message,
      });
    } else if (typeof err === "object" && err !== null && "status" in err) {
      setError(err as ApiError);
    } else {
      setError({
        message: "Произошла неизвестная ошибка",
      });
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    handleError,
    clearError,
  };
}

/**
 * Компонент для отображения состояния загрузки с возможностью ошибки
 */
interface LoadingWithErrorProps {
  isLoading: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingText?: string;
}

export function LoadingWithError({
  isLoading,
  error,
  onRetry,
  children,
  loadingText = "Загрузка...",
}: LoadingWithErrorProps) {
  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
