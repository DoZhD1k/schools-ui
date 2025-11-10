import { api } from "@/lib/axios";

// Типы для API согласно документации
export interface Role {
  id: number;
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  birth_date?: string | null;
  position: string;
  role: number;
  school?: number | null;
  role_name: string;
  school_name?: string | null;
  is_active: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  birth_date?: string;
  position: string;
  role: number;
  school?: number;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  birth_date?: string;
  position?: string;
  role?: number;
  school?: number;
  is_active?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  can_input_data?: boolean;
  can_view_reports?: boolean;
  can_view_analytics?: boolean;
  can_form_rating?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  can_input_data?: boolean;
  can_view_reports?: boolean;
  can_view_analytics?: boolean;
  can_form_rating?: boolean;
}

export interface UserQueryParams {
  search?: string;
  role?: number;
  school?: number;
  is_active?: boolean;
}

export interface RoleQueryParams {
  search?: string;
}

class AdminApiService {
  /**
   * Обработать ошибки API
   */
  private handleApiError(error: unknown): never {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { error?: string; message?: string };
        };
      };
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        "Неизвестная ошибка";

      switch (status) {
        case 401:
          throw new Error(
            "Необходимо войти в систему или токен недействителен"
          );
        case 403:
          throw new Error("У вас нет прав для выполнения этого действия");
        case 404:
          throw new Error("Запрашиваемый ресурс не найден");
        case 400:
          throw new Error(`Ошибка в данных: ${message}`);
        default:
          throw new Error(`Ошибка сервера: ${message}`);
      }
    } else if (error && typeof error === "object" && "request" in error) {
      throw new Error("Нет связи с сервером. Проверьте интернет-соединение");
    } else {
      throw new Error("Ошибка при отправке запроса");
    }
  }

  // Users API - согласно документации /school-rating/admin/users/
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    try {
      console.log("🔍 Admin API: Fetching users with params:", params);
      const response = await api.get("/school-rating/admin/users/", { params });
      console.log("✅ Admin API: Users response:", response.data);
      console.log(
        "🔢 Admin API: Response type:",
        typeof response.data,
        Array.isArray(response.data)
      );

      // API возвращает объект с пагинацией {count, next, previous, results}
      if (response.data && Array.isArray(response.data.results)) {
        console.log(
          "📄 Admin API: Returning results array:",
          response.data.results.length,
          "users"
        );
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        // Fallback: если API возвращает прямо массив
        console.log(
          "📄 Admin API: Response is direct array:",
          response.data.length,
          "users"
        );
        return response.data;
      } else {
        console.error(
          "❌ Admin API: Unexpected response format:",
          response.data
        );
        return [];
      }
    } catch (error) {
      console.error("❌ Admin API: Error fetching users:", error);
      this.handleApiError(error);
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      const response = await api.get(`/school-rating/admin/users/${id}/`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await api.post("/school-rating/admin/users/", userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put(
        `/school-rating/admin/users/${id}/`,
        userData
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/school-rating/admin/users/${id}/`);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  // Roles API - согласно документации /school-rating/admin/roles/
  async getRoles(params?: RoleQueryParams): Promise<Role[]> {
    try {
      console.log("🔍 Admin API: Fetching roles with params:", params);
      const response = await api.get("/school-rating/admin/roles/", { params });
      console.log("✅ Admin API: Roles response:", response.data);

      // API возвращает объект с пагинацией {count, next, previous, results}
      if (response.data && Array.isArray(response.data.results)) {
        console.log(
          "📄 Admin API: Returning roles array:",
          response.data.results.length,
          "roles"
        );
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        // Fallback: если API возвращает прямо массив
        return response.data;
      } else {
        console.error(
          "❌ Admin API: Unexpected roles response format:",
          response.data
        );
        return [];
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getRole(id: number): Promise<Role> {
    try {
      const response = await api.get(`/school-rating/admin/roles/${id}/`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      const response = await api.post("/school-rating/admin/roles/", roleData);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async updateRole(id: number, roleData: UpdateRoleRequest): Promise<Role> {
    try {
      const response = await api.put(
        `/school-rating/admin/roles/${id}/`,
        roleData
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      await api.delete(`/school-rating/admin/roles/${id}/`);
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

export const adminApiService = new AdminApiService();
