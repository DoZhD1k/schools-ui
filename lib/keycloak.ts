"use client";

import Keycloak from "keycloak-js";
import Cookies from "js-cookie";

// Конфигурация Keycloak — можно переопределить через env переменные
const KEYCLOAK_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_URL ||
  "https://auth.opendata.smartalmaty.kz/auth";
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "opendata";
const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "opendata";

// Создаём единственный экземпляр Keycloak (singleton)
let keycloakInstance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
    });
  }
  return keycloakInstance;
}

/**
 * Очистка всех данных авторизации (cookies, localStorage)
 */
export const clearAuthData = () => {
  Cookies.remove("kc_token");
  Cookies.remove("kc_refresh_token");
  Cookies.remove("od-name");
  Cookies.remove("od-lang");
  Cookies.remove("od-originalId");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("expiresAt");
};

/**
 * Сохранение данных пользователя из Keycloak в cookies/localStorage
 */
export const saveKeycloakUserData = async (
  kc: Keycloak,
): Promise<{
  fullName: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
} | null> => {
  try {
    const profile = await kc.loadUserProfile();
    const fullName =
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      profile.username ||
      "User";

    // Сохраняем токен в cookie для middleware (SSR)
    if (kc.token) {
      Cookies.set("kc_token", kc.token, { path: "/" });
    }
    if (kc.refreshToken) {
      Cookies.set("kc_refresh_token", kc.refreshToken, { path: "/" });
    }
    Cookies.set("od-name", fullName, { path: "/" });

    // Сохраняем токен в localStorage для axios interceptor
    if (kc.token) {
      localStorage.setItem("accessToken", kc.token);
    }

    return {
      fullName,
      email: profile.email || "",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      username: profile.username || "",
    };
  } catch (error) {
    console.error("Ошибка при сохранении данных пользователя Keycloak:", error);
    return null;
  }
};

/**
 * Обновление токена Keycloak
 * @param minValidity — минимальное время жизни токена в секундах
 */
export const refreshKeycloakToken = async (
  kc: Keycloak,
  minValidity = 70,
): Promise<boolean> => {
  try {
    const refreshed = await kc.updateToken(minValidity);
    if (refreshed) {
      console.log("🔑 Keycloak token refreshed");
      await saveKeycloakUserData(kc);
    } else if (kc.isTokenExpired()) {
      console.log("🔑 Token expired and could not be refreshed");
      clearAuthData();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Ошибка обновления токена Keycloak:", error);
    clearAuthData();
    return false;
  }
};

/**
 * Инициализация Keycloak с таймаутом.
 * Возвращает true, если пользователь аутентифицирован.
 * Если Keycloak сервер недоступен — возвращает false (не блокирует UI).
 */
export const initKeycloak = async (kc: Keycloak): Promise<boolean> => {
  const INIT_TIMEOUT = 10000; // 10 секунд максимум на инициализацию

  try {
    // Оборачиваем init в Promise.race с таймаутом,
    // чтобы не зависнуть при недоступном Keycloak сервере
    const authenticated = await Promise.race([
      kc.init({
        checkLoginIframe: false,
        pkceMethod: "S256",
        onLoad: "check-sso",
        // Не используем silentCheckSsoRedirectUri — iframe может зависнуть
        // если Keycloak сервер недоступен
      }),
      new Promise<boolean>((_, reject) =>
        setTimeout(
          () => reject(new Error("Keycloak init timeout")),
          INIT_TIMEOUT,
        ),
      ),
    ]);

    if (authenticated && kc.token && !kc.isTokenExpired()) {
      const userData = await saveKeycloakUserData(kc);

      if (userData) {
        // Проверяем, нужно ли сделать redirect после логина
        const savedPath = sessionStorage.getItem("auth_redirect_path");
        if (savedPath) {
          sessionStorage.removeItem("auth_redirect_path");
          window.location.href = savedPath;
        }
      } else {
        clearAuthData();
      }
    }

    return authenticated;
  } catch (error) {
    console.warn("⚠️ Keycloak init failed (server may be unreachable):", error);
    // НЕ бросаем ошибку — просто возвращаем false,
    // чтобы приложение продолжило работать без авторизации
    return false;
  }
};

/**
 * Начать логин через Keycloak с сохранением пути возврата.
 */
export const loginWithKeycloak = (returnPath?: string) => {
  const kc = getKeycloak();
  if (returnPath) {
    sessionStorage.setItem("auth_redirect_path", returnPath);
  }
  kc.login({
    redirectUri:
      window.location.origin + (returnPath || window.location.pathname),
  });
};

/**
 * Выход из Keycloak
 */
export const logoutKeycloak = (redirectUri?: string) => {
  const kc = getKeycloak();
  clearAuthData();
  kc.logout({
    redirectUri: redirectUri || window.location.origin,
  });
};

/**
 * Получение ролей пользователя из токена Keycloak
 */
export const getKeycloakRoles = (kc: Keycloak): string[] => {
  const realmRoles = kc.realmAccess?.roles || [];
  const clientRoles = kc.resourceAccess?.[KEYCLOAK_CLIENT_ID]?.roles || [];
  return [...realmRoles, ...clientRoles];
};

/**
 * Проверка, есть ли у пользователя определённая роль
 */
export const hasKeycloakRole = (kc: Keycloak, role: string): boolean => {
  return getKeycloakRoles(kc).includes(role);
};
