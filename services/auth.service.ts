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

      // Попробуем разные возможные endpoints для авторизации
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

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

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

          // Если у нас есть токен, пробуем получить профиль пользователя
          if (responseData.token) {
            const userProfile = await this.getUserProfile(responseData.token);

            if (userProfile.success) {
              return {
                success: true,
                data: {
                  token: responseData.token,
                  user: userProfile.data!,
                },
              };
            }
          }

          // Если нет endpoint для профиля пользователя, создаем базовый профиль
          return {
            success: true,
            data: {
              token: responseData.token,
              user: {
                id: 1,
                email: credentials.email,
                first_name: "User",
                last_name: "Name",
                position: "Пользователь",
                role_name: "Администратор",
                is_active: true,
              },
            },
          };
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
