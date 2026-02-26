const API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

// Логируем для отладки
if (typeof window === "undefined") {
  console.log("🔧 Auth Service API URL:", API_BASE_URL);
  console.log("🔧 Environment variables:", {
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthError {
  error: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  position: string;
  role_name: string;
  school_name?: string;
  is_active: boolean;
}

class AuthService {
  /**
   * Создать fetch с timeout
   */
  private fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 10000,
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout),
      ),
    ]);
  }

  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginRequest): Promise<{
    success: boolean;
    data?: { token: string; user: UserProfile };
    error?: string;
  }> {
    try {
      console.log("🔐 Attempting login with real API:", API_BASE_URL);
      console.log("📧 Email:", credentials.email);
      console.log("🌍 Environment variables:", {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
        API_BASE_URL,
        isServerSide: typeof window === "undefined",
      });

      // Попробуем разные возможные endpoints для авторизации с timeout
      const possibleEndpoints = [
        `${API_BASE_URL}/school-rating/login/`, // Основной endpoint согласно API
        // На случай проблем с CORS на Vercel используем прокси
        ...(typeof window === "undefined" &&
        process.env.NODE_ENV === "production"
          ? ["/api/auth-proxy"]
          : []),
      ];

      let lastError = "Неверные учетные данные";

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);

          // Определяем, используем ли мы прокси
          const isProxy = endpoint.startsWith("/api/");
          const fetchUrl = isProxy
            ? typeof window !== "undefined"
              ? endpoint
              : `http://localhost:3000${endpoint}`
            : endpoint;

          const response = await this.fetchWithTimeout(
            fetchUrl,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(credentials),
            },
            15000, // Увеличиваем timeout до 15 секунд для Vercel
          );

          console.log(`📡 Response from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          });

          if (response.status === 404) {
            console.log(`❌ Endpoint ${endpoint} not found, trying next...`);
            continue;
          }

          // Получаем текст ответа для лучшей диагностики
          const responseText = await response.text();
          console.log(`📦 Raw response from ${endpoint}:`, responseText);

          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("❌ Failed to parse JSON response:", parseError);
            lastError = "Сервер вернул неверный формат данных";
            continue;
          }

          console.log(
            `📦 Parsed response data from ${endpoint}:`,
            responseData,
          );

          if (!response.ok) {
            console.error("❌ Login failed:", responseData);
            lastError =
              responseData.error ||
              responseData.detail ||
              responseData.message ||
              `HTTP ${response.status}: ${response.statusText}`;
            continue;
          }

          console.log("✅ Login successful with endpoint:", endpoint);

          // Создаем базовый профиль пользователя из полученных данных
          if (responseData.token) {
            const user: UserProfile = {
              id: 1,
              email: credentials.email,
              first_name: credentials.email.includes("admin")
                ? "Admin"
                : "User",
              last_name: "User",
              patronymic: "Adminovich",
              position: credentials.email.includes("admin")
                ? "Администратор"
                : "Пользователь",
              role_name: credentials.email.includes("admin")
                ? "Администратор"
                : "Пользователь",
              school_name: undefined,
              is_active: true,
            };

            return {
              success: true,
              data: {
                token: responseData.token,
                user: user,
              },
            };
          }

          // Если токен не пришел - ошибка
          throw new Error("Токен не получен от сервера");
        } catch (endpointError) {
          console.error(`❌ Error with endpoint ${endpoint}:`, endpointError);
          if (endpointError instanceof Error) {
            lastError = endpointError.message;
          }
          continue;
        }
      }

      console.error("❌ All endpoints failed. Last error:", lastError);
      return {
        success: false,
        error: lastError,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка подключения к серверу";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Получение профиля пользователя
   */
  async getUserProfile(token: string): Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
  }> {
    try {
      // Попробуем разные возможные endpoints для получения профиля
      const possibleEndpoints = [`${API_BASE_URL}/school-rating/users/me/`];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying profile endpoint: ${endpoint}`);

          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 404) {
            console.log(
              `❌ Profile endpoint ${endpoint} not found, trying next...`,
            );
            continue;
          }

          if (!response.ok) {
            const errorData = await response.json();
            console.log(`❌ Profile endpoint ${endpoint} error:`, errorData);
            continue;
          }

          const userData = await response.json();
          console.log("✅ Profile retrieved successfully from:", endpoint);

          return {
            success: true,
            data: userData,
          };
        } catch (endpointError) {
          console.error(
            `❌ Error with profile endpoint ${endpoint}:`,
            endpointError,
          );
          continue;
        }
      }

      return {
        success: false,
        error: "Не удалось получить профиль пользователя",
      };
    } catch (error) {
      console.error("❌ Get user profile error:", error);
      return {
        success: false,
        error: "Ошибка получения профиля пользователя",
      };
    }
  }

  /**
   * Проверка действительности токена
   */
  async verifyToken(token: string): Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
  }> {
    return this.getUserProfile(token);
  }

  /**
   * Выход из системы (опционально, если есть endpoint)
   */
  async logout(token: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Если есть endpoint для logout на сервере
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        // Если endpoint не существует, просто возвращаем успех
        // так как logout обычно происходит на клиенте
        return { success: true };
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Даже если произошла ошибка, считаем logout успешным
      // так как токен будет удален на клиенте
      return { success: true };
    }
  }
}

export const authService = new AuthService();
