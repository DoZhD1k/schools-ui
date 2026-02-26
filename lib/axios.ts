import axios from "axios";
import https from "https";

// Get API URL from environment variables with a fallback
const apiUrl =
  process.env.NEXT_PUBLIC_SCHOOL_RATING_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring"; // Default to institutions-monitoring API

// Log for debugging
if (typeof window === "undefined") {
  console.log("Server-side API URL:", apiUrl);
}

// Determine if we're in development environment
const isDev = process.env.NODE_ENV === "development";

export const api = axios.create({
  baseURL: apiUrl,
  paramsSerializer: {
    indexes: null,
    encode: (param: string) => param,
  },
  // Add HTTPS agent configuration for development to handle SSL issues
  ...(isDev &&
    typeof window === "undefined" && {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }),
});

// Add interceptor with optional trailing slash and auth token
api.interceptors.request.use((config) => {
  // Only add trailing slash if not explicitly disabled
  if (
    config.url &&
    !config.url.endsWith("/") &&
    config.headers?.addTrailingSlash !== false
  ) {
    config.url += "/";
  }

  // Автоматически добавляем токен из localStorage если он не установлен в headers
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Keycloak использует Bearer токены (JWT)
      // Если токен уже содержит префикс — используем как есть
      let authToken: string;
      if (token.startsWith("Bearer ") || token.startsWith("Token ")) {
        authToken = token;
      } else {
        authToken = `Bearer ${token}`;
      }

      // Устанавливаем заголовок независимо от того, есть ли он уже
      config.headers.Authorization = authToken;

      // Debugging info
      const isJWT = token.includes(".");
      const isMock = token.includes("mock") || token.startsWith("eyJ"); // JWT starts with eyJ
      console.log("Adding auth token to request:", {
        url: config.url,
        fullUrl: `${config.baseURL}${config.url}`,
        tokenType: isJWT ? "JWT" : "other",
        isMockToken: isMock && !isJWT,
        tokenPrefix: authToken.substring(0, 15) + "...",
        hasAuthHeader: !!config.headers.Authorization,
      });
    } else {
      console.log("❌ No token found in localStorage for request:", config.url);
    }
  } else {
    console.log("🖥️ Server-side request, no localStorage access:", config.url);
  }

  return config;
});

let isRefreshing = false;

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const setAuthHeader = (token: string | null) => {
  console.log("🔧 Setting auth header:", {
    token: token ? token.substring(0, 15) + "..." : null,
  });

  if (token) {
    // Проверяем, содержит ли токен уже префикс
    if (token.startsWith("Token ") || token.startsWith("Bearer ")) {
      api.defaults.headers.common["Authorization"] = token;
    } else {
      // По умолчанию используем Bearer (Keycloak JWT)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    console.log(
      "✅ Auth header set:",
      api.defaults.headers.common["Authorization"]?.substring(0, 15) + "...",
    );
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("❌ Auth header removed");
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Handle URL generation differently based on environment
        let refreshUrl: string;

        if (typeof window !== "undefined") {
          // Browser environment - use window.location.origin
          refreshUrl = `${window.location.origin}/api/refresh-token`;
        } else {
          // Server environment - use a fully qualified URL or an absolute path
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
          refreshUrl = `${siteUrl}/api/refresh-token`;
        }

        const response = await fetch(refreshUrl, { method: "POST" });
        const data = await response.json();

        if (response.ok) {
          setAuthHeader(data.access_token);
          processQueue();
          return api(originalRequest);
        } else {
          processQueue(error);
          // Проверяем, находимся ли мы на защищенном маршруте, который требует авторизации
          // Для защищенных маршрутов перенаправляем только когда пользователь не активно
          // редактирует данные (определяем по URL и активным формам)
          if (typeof window !== "undefined") {
            const isProtectedRoute =
              window.location.pathname.includes("/admin") ||
              window.location.pathname.includes("/map");

            // Проверяем, находится ли пользователь в режиме редактирования в админке
            // (наличие определенных URL параметров или путей)
            const isEditMode =
              window.location.pathname.includes("/edit") ||
              document.querySelector("form") !== null;

            if (isProtectedRoute && !isEditMode) {
              window.location.href = "/sign-in";
            }
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
