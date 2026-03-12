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
import Keycloak from "keycloak-js";
import {
  getKeycloak,
  initKeycloak,
  clearAuthData,
  saveKeycloakUserData,
  refreshKeycloakToken,
  logoutKeycloak,
  getKeycloakRoles,
} from "@/lib/keycloak";
import { fetchLegacyToken } from "@/lib/auth-utils";

// ────────────────────────────────────────────────────
// Типы
// ────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  position: string;
  role: number;
  role_name: string;
  school?: number | null;
  school_name?: string | null;
  is_active: boolean;
  keycloakRoles?: string[];
  rolePermissions?: {
    id: number;
    name: string;
    can_input_data: boolean;
    can_view_reports: boolean;
    can_view_analytics: boolean;
    can_form_rating: boolean;
  };
}

export interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null, expires_in?: number) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  userProfile: UserProfile | null;
  userRole: string | null;
  isAdmin: boolean;
  keycloak: Keycloak | null;
  login: (returnPath?: string) => void;
  logout: () => Promise<void>;
}

// ────────────────────────────────────────────────────
// Контекст
// ────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ────────────────────────────────────────────────────
// Вспомогательные функции
// ────────────────────────────────────────────────────

/**
 * Определяем role ID по названию роли (из Keycloak ролей)
 */
function resolveRoleFromKeycloak(roles: string[]): {
  role: number;
  role_name: string;
} {
  if (roles.includes("admin") || roles.includes("Администратор")) {
    return { role: 1, role_name: "Администратор" };
  }
  if (
    roles.includes("organization") ||
    roles.includes("Организация образования")
  ) {
    return { role: 2, role_name: "Организация образования" };
  }
  if (
    roles.includes("management") ||
    roles.includes("Управление образования")
  ) {
    return { role: 3, role_name: "Управление образования" };
  }
  // По умолчанию — обычный пользователь
  return { role: 0, role_name: "Пользователь" };
}

/**
 * Собираем UserProfile из данных Keycloak
 */
function buildUserProfile(
  kc: Keycloak,
  profileData: {
    fullName: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  },
): UserProfile {
  const kcRoles = getKeycloakRoles(kc);
  const { role, role_name } = resolveRoleFromKeycloak(kcRoles);

  // Пытаемся взять id из токена (sub)
  const tokenPayload = kc.tokenParsed as Record<string, unknown> | undefined;
  const sub = tokenPayload?.sub as string | undefined;

  return {
    id: sub ? parseInt(sub, 10) || 0 : 0,
    email: profileData.email,
    first_name: profileData.firstName,
    last_name: profileData.lastName,
    patronymic: "",
    position: role_name,
    role,
    role_name,
    school: null,
    school_name: null,
    is_active: true,
    keycloakRoles: kcRoles,
  };
}

// ────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [keycloakReady, setKeycloakReady] = useState(false);
  const initCalled = useRef(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // ── setAccessToken (совместимость с существующим кодом) ──
  const setAccessToken = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (token: string | null, _expiresIn?: number) => {
      setAccessTokenState(token);
      if (token) {
        setAuthHeader(`Bearer ${token}`);
        localStorage.setItem("accessToken", token);
      } else {
        setAuthHeader(null);
        clearAuthData();
        setUserProfile(null);
      }
    },
    [],
  );

  // ── Инициализация Keycloak ──
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    const bootstrap = async () => {
      setIsLoading(true);

      // При первом запуске после миграции на Keycloak —
      // очищаем старые токены (формат Token xxx), они больше не валидны
      const savedToken = localStorage.getItem("accessToken");
      if (savedToken && !savedToken.includes(".")) {
        // Старый токен (не JWT) — удаляем
        console.log("🧹 Clearing old non-JWT token from localStorage");
        clearAuthData();
      }

      try {
        const kc = getKeycloak();
        const authenticated = await initKeycloak(kc);
        setKeycloak(kc);
        setKeycloakReady(true);

        if (authenticated && kc.token) {
          // Сохраняем токен
          setAccessTokenState(kc.token);
          setAuthHeader(`Bearer ${kc.token}`);
          localStorage.setItem("accessToken", kc.token);

          // Загружаем профиль
          const profileData = await saveKeycloakUserData(kc);
          if (profileData) {
            const profile = buildUserProfile(kc, profileData);
            setUserProfile(profile);
            localStorage.setItem("userProfile", JSON.stringify(profile));
            console.log("✅ Keycloak authenticated:", profile.email);
          }

          // Получаем legacy-токен от старого API для доступа к данным
          fetchLegacyToken().catch((err: unknown) =>
            console.warn("⚠️ Legacy token fetch failed (non-critical):", err),
          );

          // Автообновление токена каждые 30 секунд
          refreshIntervalRef.current = setInterval(async () => {
            const success = await refreshKeycloakToken(kc);
            if (success && kc.token) {
              setAccessTokenState(kc.token);
              setAuthHeader(`Bearer ${kc.token}`);
              localStorage.setItem("accessToken", kc.token);
            } else {
              // Токен не удалось обновить — разлогиниваем
              setAccessTokenState(null);
              setUserProfile(null);
              setAuthHeader(null);
              clearAuthData();
            }
          }, 30000);

          // Обработчик истечения токена
          kc.onTokenExpired = async () => {
            console.log("🔑 Token expired, refreshing...");
            const success = await refreshKeycloakToken(kc);
            if (success && kc.token) {
              setAccessTokenState(kc.token);
              setAuthHeader(`Bearer ${kc.token}`);
              localStorage.setItem("accessToken", kc.token);
            }
          };
        } else {
          // Keycloak инициализирован, но пользователь НЕ аутентифицирован —
          // очищаем любые сохранённые данные (старые токены не валидны)
          console.log(
            "ℹ️ Keycloak: user not authenticated, clearing saved data",
          );
          clearAuthData();
        }
      } catch (error) {
        console.error("❌ Keycloak init error:", error);
        // Keycloak недоступен — очищаем данные, пользователь неавторизован
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ── Логин через Keycloak ──
  const login = useCallback(
    (returnPath?: string) => {
      if (!keycloakReady) {
        // Keycloak не инициализировался (сервер недоступен) —
        // не делаем redirect на /sign-in (можем попасть в цикл),
        // просто логируем
        console.warn("⚠️ Keycloak not ready, cannot login");
        return;
      }
      const kc = keycloak || getKeycloak();
      if (returnPath) {
        sessionStorage.setItem("auth_redirect_path", returnPath);
      }
      kc.login({
        redirectUri:
          window.location.origin + (returnPath || window.location.pathname),
      });
    },
    [keycloak, keycloakReady],
  );

  // ── Логаут через Keycloak ──
  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out via Keycloak");
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      setAccessTokenState(null);
      setUserProfile(null);
      setAuthHeader(null);
      clearAuthData();

      if (keycloak?.authenticated) {
        logoutKeycloak(window.location.origin);
      } else {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/sign-in");
    }
  }, [keycloak, router]);

  // ── Синхронизация между вкладками ──
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "accessToken") {
        if (event.newValue) {
          if (event.newValue !== accessToken) {
            setAccessTokenState(event.newValue);
            setAuthHeader(`Bearer ${event.newValue}`);
          }
        } else {
          setAccessTokenState(null);
          setUserProfile(null);
          setAuthHeader(null);

          const isProtectedRoute =
            window.location.pathname.includes("/admin") ||
            window.location.pathname.includes("/map") ||
            window.location.pathname.includes("/dashboard");

          if (isProtectedRoute) {
            router.push("/sign-in");
          }
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router, accessToken]);

  // ── Роли ──
  const userRole = userProfile?.role_name || null;
  const isAdmin =
    userRole === "Администратор" ||
    userRole === "admin" ||
    (userProfile?.keycloakRoles?.includes("admin") ?? false);

  // ── Защита маршрутов на клиенте ──
  useEffect(() => {
    if (!isLoading) {
      const protectedPaths = [
        "/admin",
        "/map",
        "/dashboard",
        "/schools",
        "/analytics",
        "/deficit",
        "/profile",
      ];
      const isProtectedRoute = protectedPaths.some(
        (path) =>
          typeof window !== "undefined" &&
          window.location.pathname.includes(path),
      );

      const isSignInPage =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/sign-in");

      const authenticated = !!accessToken && !!userProfile;

      if (isProtectedRoute && !authenticated && !isSignInPage) {
        console.log(
          "🚫 Access denied to protected route, redirecting to sign-in",
        );
        // Перенаправляем на /sign-in — там пользователь сможет нажать кнопку логина
        const lang =
          typeof window !== "undefined"
            ? window.location.pathname.split("/")[1] || "ru"
            : "ru";
        router.push(`/${lang}/sign-in`);
      }
    }
  }, [accessToken, userProfile, isLoading, router]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        setUserProfile,
        isLoading,
        isAuthenticated: !!accessToken && !!userProfile,
        user: userProfile,
        userProfile,
        userRole,
        isAdmin,
        keycloak,
        login,
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
