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

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  position: string;
  role: number; // ID роли
  role_name: string;
  school?: number | null; // ID школы
  school_name?: string | null;
  is_active: boolean;
  rolePermissions?: {
    id: number;
    name: string;
    can_input_data: boolean;
    can_view_reports: boolean;
    can_view_analytics: boolean;
    can_form_rating: boolean;
  };
}

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null, expires_in?: number) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null; // Добавляем алиас для userProfile
  userProfile: UserProfile | null;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const setAccessToken = useCallback(
    (token: string | null, expires_in?: number) => {
      setAccessTokenState(token);

      // Дополнительная отладочная информация для продакшн
      if (process.env.NODE_ENV === "production") {
        console.log("🔧 Setting access token:", {
          hasToken: !!token,
          tokenPrefix: token ? token.substring(0, 10) + "..." : "null",
          environment: "production",
          expires_in,
        });
      }

      // Обновляем заголовок авторизации для axios
      if (token) {
        setAuthHeader(`Token ${token}`);
        localStorage.setItem("accessToken", token);
      } else {
        setAuthHeader(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userProfile");
        setUserProfile(null);
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
    [] // Убираем все зависимости для предотвращения циклов
  );

  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out user");

      // Если есть токен, уведомляем сервер о выходе
      if (accessToken) {
        try {
          await fetch("/api/sign-out", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${accessToken}`,
            },
          });
        } catch (error) {
          console.error("Error during server logout:", error);
          // Не блокируем logout при ошибке сервера
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setUserProfile(null);
      router.push("/sign-in");
    }
  }, [accessToken, router, setAccessToken]);

  const refreshAccessToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Token ${accessToken}` }),
        },
      });

      const data = await response.json();

      if (response.ok) {
        const newToken = data.access_token;

        if (newToken !== previousToken.current) {
          previousToken.current = newToken;
          // Устанавливаем токен напрямую чтобы избежать циклов
          setAccessTokenState(newToken);
          setAuthHeader(`Token ${newToken}`);
          localStorage.setItem("accessToken", newToken);

          if (data.expires_in) {
            const expiryTime = Date.now() + data.expires_in * 1000;
            setExpiresAt(expiryTime);
            localStorage.setItem("expiresAt", expiryTime.toString());
          }

          // Сохраняем профиль пользователя
          if (data.user) {
            console.log("📥 Received user data from API:", data.user);

            // Если нет role ID, но есть role_name, определяем ID по названию
            if (!data.user.role && data.user.role_name) {
              console.log(
                "🔧 Fixing missing role ID based on role_name:",
                data.user.role_name
              );
              switch (data.user.role_name) {
                case "Администратор":
                  data.user.role = 1;
                  break;
                case "Организация образования":
                  data.user.role = 2;
                  break;
                case "Управление образования":
                  data.user.role = 3;
                  break;
                default:
                  console.warn("⚠️ Unknown role_name:", data.user.role_name);
              }
              console.log("✅ Fixed user data with role ID:", data.user.role);
            }

            setUserProfile(data.user);
            localStorage.setItem("userProfile", JSON.stringify(data.user));
          } else {
            console.log("❌ No user data in API response:", data);
          }
        }
      } else {
        console.error("Failed to refresh token:", data.message);
        setAccessTokenState(null);
        setUserProfile(null);
        setAuthHeader(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userProfile");

        // Проверяем, находимся ли мы на защищенном маршруте
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
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAccessTokenState(null);
      setUserProfile(null);
      setAuthHeader(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userProfile");

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
  }, [router, accessToken]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const savedToken = localStorage.getItem("accessToken");
      const savedProfile = localStorage.getItem("userProfile");
      const savedExpiresAt = localStorage.getItem("expiresAt");

      if (savedToken) {
        // Загружаем профиль пользователя если он есть
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            console.log("📦 Loaded profile from localStorage:", parsedProfile);

            // Если нет role ID, но есть role_name, определяем ID по названию
            if (!parsedProfile.role && parsedProfile.role_name) {
              console.log(
                "🔧 Fixing missing role ID based on role_name:",
                parsedProfile.role_name
              );
              switch (parsedProfile.role_name) {
                case "Администратор":
                  parsedProfile.role = 1;
                  break;
                case "Организация образования":
                  parsedProfile.role = 2;
                  break;
                case "Управление образования":
                  parsedProfile.role = 3;
                  break;
                default:
                  console.warn(
                    "⚠️ Unknown role_name:",
                    parsedProfile.role_name
                  );
              }
              console.log("✅ Fixed profile with role ID:", parsedProfile.role);
            }

            setUserProfile(parsedProfile);
          } catch (error) {
            console.error("Error parsing saved user profile:", error);
          }
        } else {
          console.log("📦 No saved profile in localStorage");
        }

        if (savedExpiresAt) {
          const now = Date.now();
          const expiryTime = Number(savedExpiresAt);

          if (now < expiryTime) {
            setAccessTokenState(savedToken);
            setAuthHeader(`Token ${savedToken}`);
            setExpiresAt(expiryTime);
          } else {
            await refreshAccessToken();
          }
        } else {
          // Если нет времени истечения, устанавливаем токен и проверяем его
          setAccessTokenState(savedToken);
          setAuthHeader(`Token ${savedToken}`);
          await refreshAccessToken();
        }
      } else {
        // Если нет сохраненного токена, попытка обновления (это вернет ошибку, что нормально)
        await refreshAccessToken();
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (accessToken && expiresAt) {
      const now = Date.now();
      const timeoutDuration = expiresAt - now - 10 * 1000; // Обновляем за 10 секунд до истечения

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
            setAccessTokenState(event.newValue);
            setAuthHeader(`Token ${event.newValue}`);
          }
        } else {
          setAccessTokenState(null);
          setUserProfile(null);
          setAuthHeader(null);

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
  }, [router, accessToken]);

  // Определяем роль и права доступа
  const userRole = userProfile?.role_name || null;
  const isAdmin = userRole === "Администратор" || userRole === "admin";

  // Добавляем отладку для проверки данных пользователя
  useEffect(() => {
    if (userProfile) {
      console.log("🔍 Auth Context - User Profile:", userProfile);
      console.log("📋 User Role ID:", userProfile.role);
      console.log("📋 User Role Name:", userProfile.role_name);
      console.log(
        "🏫 User School:",
        userProfile.school,
        userProfile.school_name
      );
      console.log("👤 Is Admin:", isAdmin);
    }
  }, [userProfile, isAdmin]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        setUserProfile,
        isLoading,
        isAuthenticated: !!accessToken && !!userProfile,
        user: userProfile, // Алиас для userProfile
        userProfile,
        userRole,
        isAdmin,
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
