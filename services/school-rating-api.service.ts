/**
 * School Rating API Service
 * Сервис для работы с API модуля "Рейтинг Школ"
 * Base URL: https://admin.smartalmaty.kz/api/v1/institutions-monitoring/
 */

import {
  LoginRequest,
  LoginResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  ApiResponse,
  UserQueryParams,
  RoleQueryParams,
  HttpStatusCode,
} from "@/types/school-rating-api";

// Используем локальные API routes для избежания CORS
const API_BASE_URL = "/api/school-rating";

class SchoolRatingApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Token ${token}` }), // Используем Token вместо Bearer
    };
  }

  private async handleApiResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      let errorMessage = "Произошла ошибка";
      let errorDetails: Record<string, unknown> = {};

      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData;
        } catch {
          // Если не удалось распарсить JSON, используем текст
          errorMessage = await response.text();
        }
      } else {
        errorMessage = await response.text();
      }

      // Обработка различных HTTP кодов согласно документации
      switch (response.status) {
        case HttpStatusCode.UNAUTHORIZED:
          errorMessage = "Необходимо войти в систему или токен недействителен";
          break;
        case HttpStatusCode.FORBIDDEN:
          errorMessage = "У вас нет прав для выполнения этого действия";
          break;
        case HttpStatusCode.NOT_FOUND:
          errorMessage = "Запрашиваемый ресурс не найден или вам недоступен";
          break;
        case HttpStatusCode.BAD_REQUEST:
          errorMessage =
            (errorDetails.message as string) || "Некорректные данные запроса";
          break;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    if (isJson) {
      const data = await response.json();
      return {
        success: true,
        data: data as T,
      };
    }

    return {
      success: true,
      data: {} as T,
    };
  }

  // =================== AUTHENTICATION ===================

  /**
   * Авторизация пользователя
   * POST /school-rating/login/
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const url = `${API_BASE_URL}/login`;
      console.log("🔐 Login attempt:", {
        url,
        credentials: { email: credentials.email, password: "[HIDDEN]" },
        API_BASE_URL,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("📡 Login response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      return this.handleApiResponse<LoginResponse>(response);
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: "Ошибка подключения к серверу",
      };
    }
  }

  // =================== USER MANAGEMENT ===================

  /**
   * Получить список всех пользователей (только для администраторов)
   * GET /school-rating/admin/users/
   */
  async getUsers(params?: UserQueryParams): Promise<ApiResponse<User[]>> {
    try {
      const url = new URL(`${API_BASE_URL}/school-rating/admin/users/`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      return this.handleApiResponse<User[]>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при загрузке пользователей",
      };
    }
  }

  /**
   * Получить информацию о конкретном пользователе
   * GET /school-rating/admin/users/{id}/
   */
  async getUser(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/users/${userId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return this.handleApiResponse<User>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при загрузке пользователя",
      };
    }
  }

  /**
   * Создать нового пользователя
   * POST /school-rating/admin/users/
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/users/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      return this.handleApiResponse<User>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при создании пользователя",
      };
    }
  }

  /**
   * Полностью обновить информацию о пользователе
   * PUT /school-rating/admin/users/{id}/
   */
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/users/${userId}/`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      return this.handleApiResponse<User>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при обновлении пользователя",
      };
    }
  }

  /**
   * Частично обновить информацию о пользователе
   * PATCH /school-rating/admin/users/{id}/
   */
  async patchUser(
    userId: number,
    userData: Partial<UpdateUserRequest>
  ): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/users/${userId}/`,
        {
          method: "PATCH",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(userData),
        }
      );

      return this.handleApiResponse<User>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при обновлении пользователя",
      };
    }
  }

  /**
   * Удалить пользователя
   * DELETE /school-rating/admin/users/{id}/
   */
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/users/${userId}/`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      return this.handleApiResponse<void>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при удалении пользователя",
      };
    }
  }

  // =================== ROLE MANAGEMENT ===================

  /**
   * Получить список всех ролей
   * GET /school-rating/admin/roles/
   */
  async getRoles(params?: RoleQueryParams): Promise<ApiResponse<Role[]>> {
    try {
      const url = new URL(`${API_BASE_URL}/school-rating/admin/roles/`);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      return this.handleApiResponse<Role[]>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при загрузке ролей",
      };
    }
  }

  /**
   * Получить информацию о конкретной роли
   * GET /school-rating/admin/roles/{id}/
   */
  async getRole(roleId: number): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/roles/${roleId}/`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      return this.handleApiResponse<Role>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при загрузке роли",
      };
    }
  }

  /**
   * Создать новую роль
   * POST /school-rating/admin/roles/
   */
  async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/roles/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(roleData),
        }
      );

      return this.handleApiResponse<Role>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при создании роли",
      };
    }
  }

  /**
   * Обновить роль
   * PUT /school-rating/admin/roles/{id}/
   */
  async updateRole(
    roleId: number,
    roleData: UpdateRoleRequest
  ): Promise<ApiResponse<Role>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/roles/${roleId}/`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(roleData),
        }
      );

      return this.handleApiResponse<Role>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при обновлении роли",
      };
    }
  }

  /**
   * Удалить роль
   * DELETE /school-rating/admin/roles/{id}/
   */
  async deleteRole(roleId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/school-rating/admin/roles/${roleId}/`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      return this.handleApiResponse<void>(response);
    } catch {
      return {
        success: false,
        error: "Ошибка при удалении роли",
      };
    }
  }
}

// Экспортируем singleton instance
export const schoolRatingApiService = new SchoolRatingApiService();
