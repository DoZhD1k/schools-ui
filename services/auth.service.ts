/**
 * Сервис аутентификации для работы с реальным API
 * Base URL: https://admin.smartalmaty.kz/api/v1/school-rating/
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

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
    timeout = 10000
  ): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  }

  /**
   * Mock авторизация для тестовых аккаунтов
   */
  private async mockLogin(credentials: LoginRequest): Promise<{
    success: boolean;
    data?: { token: string; user: UserProfile };
    error?: string;
  }> {
    // Имитируем задержку сети
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Проверяем тестовые учетные данные
    const testCredentials = [
      { email: "admin@test.com", password: "admin123456" },
      { email: "admin@test.com", password: "password123" },
      { email: "school_a@test.com", password: "user123" },
    ];

    const validCredentials = testCredentials.find(
      (cred) =>
        cred.email === credentials.email &&
        cred.password === credentials.password
    );

    if (!validCredentials) {
      return {
        success: false,
        error: "Неверные тестовые учетные данные",
      };
    }

    // Создаем mock токен (валидный JWT для dev)
    const mockToken =
      "mock_token_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substr(2, 9);

    const mockUser: UserProfile = {
      id: 1,
      email: credentials.email,
      first_name: "Test",
      last_name: "User",
      patronymic: "Testovich",
      position: "Test Administrator",
      role_name: credentials.email.includes("admin")
        ? "Администратор"
        : "Пользователь",
      school_name: credentials.email.includes("school")
        ? "Test School"
        : undefined,
      is_active: true,
    };

    console.log("✅ Mock authentication successful for:", credentials.email);

    return {
      success: true,
      data: {
        token: mockToken,
        user: mockUser,
      },
    };
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

      // Проверяем принудительное использование моков через переменную окружения
      const forceMockAuth = process.env.NEXT_PUBLIC_FORCE_MOCK_AUTH === "true";

      // Используем mock только если принудительно включен
      if (forceMockAuth) {
        console.log(
          "🎭 Using mock authentication (forced by environment variable)"
        );
        return this.mockLogin(credentials);
      }

      // Попробуем разные возможные endpoints для авторизации с timeout
      const possibleEndpoints = [
        `${API_BASE_URL}/school-rating/login/`, // Основной endpoint согласно API
        `${API_BASE_URL}/auth/login/`,
        `${API_BASE_URL}/login/`,
        `${API_BASE_URL}/school-rating/auth/login/`,
      ];

      let lastError = "Неверные учетные данные";

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);

          const response = await this.fetchWithTimeout(
            endpoint,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(credentials),
            },
            10000
          ); // 10 секунд timeout

          console.log(`📡 Response from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          });

          if (response.status === 404) {
            console.log(`❌ Endpoint ${endpoint} not found, trying next...`);
            continue;
          }

          const responseData = await response.json();
          console.log(`📦 Response data from ${endpoint}:`, responseData);

          if (!response.ok) {
            console.error("❌ Login failed:", responseData);
            lastError =
              responseData.error ||
              responseData.detail ||
              responseData.message ||
              "Неверные учетные данные";
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
          continue;
        }
      }

      return {
        success: false,
        error: lastError,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: "Ошибка подключения к серверу",
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
      const possibleEndpoints = [
        `${API_BASE_URL}/school-rating/users/me/`,
        `${API_BASE_URL}/school-rating/auth/user/`,
        `${API_BASE_URL}/auth/user/`,
        `${API_BASE_URL}/users/me/`,
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying profile endpoint: ${endpoint}`);

          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          });

          if (response.status === 404) {
            console.log(
              `❌ Profile endpoint ${endpoint} not found, trying next...`
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
            endpointError
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
          Authorization: `Token ${token}`,
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
