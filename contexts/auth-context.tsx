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
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null, expires_in?: number) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

interface JwtPayload {
  sub: string;
  role?: string;
  exp: number;
  iat: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const previousToken = useRef<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const extractRoleFromToken = (token: string): string | null => {
    try {
      // Check if token has the correct JWT format (3 parts separated by dots)
      if (!token || token.split(".").length !== 3) {
        console.error("Invalid token format:", token);
        return null;
      }

      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.role || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const setAccessToken = useCallback(
    (token: string | null, expires_in?: number) => {
      setAccessTokenState(token);
      setAuthHeader(token);

      if (token) {
        localStorage.setItem("accessToken", token);
        const role = extractRoleFromToken(token);
        setUserRole(role);
      } else {
        localStorage.removeItem("accessToken");
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
      await fetch("/api/sign-out", { method: "POST" });
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
          // Используем тихое перенаправление без перезагрузки страницы
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
        // Используем тихую навигацию для предотвращения полной перезагрузки
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
        // Validate token format before using it
        if (savedToken.split(".").length !== 3) {
          console.error("Invalid token format in localStorage, clearing...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("expiresAt");
          await refreshAccessToken();
        } else {
          const now = Date.now();
          const expiryTime = Number(savedExpiresAt);

          if (now < expiryTime) {
            setAccessToken(savedToken, (expiryTime - now) / 1000);
          } else {
            await refreshAccessToken();
          }
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
            // Плавное обновление токена без перезагрузки страницы
            setAccessToken(event.newValue);
          }
        } else {
          // При потере токена
          setAccessToken(null);

          // Проверяем, находимся ли мы на защищенном маршруте
          const isProtectedRoute =
            window.location.pathname.includes("/admin") ||
            window.location.pathname.includes("/map");

          // Используем тихую навигацию для предотвращения полной перезагрузки страницы
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
        isAdmin: userRole === "admin",
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
