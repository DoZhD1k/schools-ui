/**
 * Утилита для получения legacy-токена от старого API авторизации.
 *
 * После авторизации через Keycloak автоматически вызывается старый
 * endpoint login чтобы получить `Token xxx` для доступа к данным
 * закрытого API (school-rating и др.).
 *
 * Креды по умолчанию — временное решение, пока API не переведён на Keycloak.
 */

const LEGACY_LOGIN_URL = "/api/school-rating/login"; // проксируется через Next.js API route → admin.smartalmaty.kz

const DEFAULT_EMAIL = "admin@test.com";
const DEFAULT_PASSWORD = "admin123456";

const STORAGE_KEY = "legacyApiToken";

/**
 * Вызвать старый login endpoint и сохранить полученный токен.
 * Возвращает токен или null при ошибке.
 */
export async function fetchLegacyToken(): Promise<string | null> {
  try {
    console.log("🔑 Fetching legacy API token...");

    const response = await fetch(LEGACY_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: DEFAULT_EMAIL,
        password: DEFAULT_PASSWORD,
      }),
    });

    if (!response.ok) {
      console.error(
        "❌ Legacy login failed:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();
    const token: string | undefined = data.token;

    if (!token) {
      console.error("❌ Legacy login: no token in response", data);
      return null;
    }

    localStorage.setItem(STORAGE_KEY, token);
    console.log("✅ Legacy API token saved");
    return token;
  } catch (error) {
    console.error("❌ Legacy login error:", error);
    return null;
  }
}

/**
 * Получить сохранённый legacy-токен из localStorage.
 */
export function getLegacyToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Очистить legacy-токен.
 */
export function clearLegacyToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
