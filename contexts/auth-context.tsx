"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setAuthHeader } from "@/lib/axios";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null, expires_in?: number) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const previousToken = useRef<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Простая функция для извлечения роли из токена
  // Согласно API документации, роль должна определяться на основе данных пользователя
  const extractRoleFromLocalStorage = (): string | null => {
    try {
      // Попробуем получить роль из localStorage, где мы её сохранили при входе
      const savedRole = localStorage.getItem("userRole");
      return savedRole;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  const setAccessToken = useCallback(
    (token: string | null, expires_in?: number) => {
      setAccessTokenState(token);

      // Обновляем заголовок авторизации для axios
      // Согласно API документации используем формат "Token XXX"
      if (token) {
        setAuthHeader(`Token ${token}`);
        localStorage.setItem("accessToken", token);

        // Роль будет установлена отдельно при успешном входе
        const role = extractRoleFromLocalStorage();
        setUserRole(role);
      } else {
        setAuthHeader(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        setUserRole(null);
      }

      if (expires_in) {
        const expiryTime = Date.now() + expires_in * 1000;
        setExpiresAt(expiryTime);
        localStorage.setItem("expiresAt", expiryTime.toString());
      } else {
        setExpiresAt(null);
        localStorage.removeItem("expiresAt");
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      // Согласно API документации, специального endpoint для logout нет
      // Просто очищаем токен на клиенте
      console.log("Logging out user");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      router.push("/sign-in");
    }
  }, [router, setAccessToken]);

  const refreshAccessToken = useCallback(async () => {
    setIsLoading(true);
    try {
      // Используем существующий endpoint для обновления токена
      // В будущем можно адаптировать под новый API
      const response = await fetch("/api/refresh-token", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        const newToken = data.access_token;

        if (newToken !== previousToken.current) {
          previousToken.current = newToken;
          setAccessToken(newToken, data.expires_in);
          // Не выполняем никаких перенаправлений после успешного обновления токена
        }
      } else {
        console.error("Failed to refresh token:", data.message);
        setAccessToken(null);

        // Проверяем, находимся ли мы на защищенном маршруте и не в процессе входа
        const isProtectedRoute =
          window.location.pathname.includes("/ru/admin") ||
          window.location.pathname.includes("/en/admin") ||
          window.location.pathname.includes("/kz/admin") ||
          window.location.pathname.includes("/ru/map") ||
          window.location.pathname.includes("/en/map") ||
          window.location.pathname.includes("/kz/map");

        const isSignInPage = window.location.pathname.includes("/sign-in");

        // Делаем перенаправление только если мы на защищенном маршруте и НЕ на странице входа
        if (isProtectedRoute && !isSignInPage) {
          router.push("/sign-in");
        }
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAccessToken(null);

      const isProtectedRoute =
        window.location.pathname.includes("/ru/admin") ||
        window.location.pathname.includes("/en/admin") ||
        window.location.pathname.includes("/kz/admin") ||
        window.location.pathname.includes("/ru/map") ||
        window.location.pathname.includes("/en/map") ||
        window.location.pathname.includes("/kz/map");

      const isSignInPage = window.location.pathname.includes("/sign-in");

      if (isProtectedRoute && !isSignInPage) {
        router.push("/sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, setAccessToken]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const savedToken = localStorage.getItem("accessToken");
      const savedExpiresAt = localStorage.getItem("expiresAt");

      if (savedToken && savedExpiresAt) {
        const now = Date.now();
        const expiryTime = Number(savedExpiresAt);

        if (now < expiryTime) {
          setAccessToken(savedToken, (expiryTime - now) / 1000);
        } else {
          await refreshAccessToken();
        }
      } else {
        await refreshAccessToken();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshAccessToken, setAccessToken]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (accessToken && expiresAt) {
      const now = Date.now();
      const timeoutDuration = expiresAt - now - 10 * 1000;

      if (timeoutDuration > 0) {
        timer = setTimeout(refreshAccessToken, timeoutDuration);
      } else {
        refreshAccessToken();
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [accessToken, expiresAt, refreshAccessToken]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "accessToken") {
        if (event.newValue) {
          if (event.newValue !== accessToken) {
            setAccessToken(event.newValue);
          }
        } else {
          setAccessToken(null);

          const isProtectedRoute =
            window.location.pathname.includes("/admin") ||
            window.location.pathname.includes("/map");

          if (isProtectedRoute) {
            router.push("/sign-in");
          }
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router, accessToken, setAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        isLoading,
        isAuthenticated: !!accessToken,
        userRole,
        isAdmin: userRole === "Администратор", // Согласно новой API документации
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
