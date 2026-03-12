// User management service for admin panel

import {
  User,
  CreateUserForm,
  UserTableParams,
  UserTableResponse,
  UserDetails,
  LoginValidationResponse,
  ApiResponse,
  Role,
  Organization,
  District,
} from "@/types/user-management";
import { api } from "@/lib/axios";

const API_BASE = "/api/admin/users";

export class UserManagementService {
  // Create new user
  static async createUser(
    userData: CreateUserForm
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`${API_BASE}`, userData);
      return {
        success: true,
        data: response.data,
        message: "Пользователь успешно создан",
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get users with pagination and filters
  static async getUsers(
    params: UserTableParams
  ): Promise<ApiResponse<UserTableResponse>> {
    try {
      const response = await api.get(`${API_BASE}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get user details by ID
  static async getUserDetails(
    userId: string
  ): Promise<ApiResponse<UserDetails>> {
    try {
      const response = await api.get(`${API_BASE}/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Update user
  static async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch(`${API_BASE}/${userId}`, userData);
      return {
        success: true,
        data: response.data,
        message: "Пользователь успешно обновлен",
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`${API_BASE}/${userId}`);
      return {
        success: true,
        message: "Пользователь успешно удален",
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Validate login availability
  static async validateLogin(
    login: string
  ): Promise<ApiResponse<LoginValidationResponse>> {
    try {
      const response = await api.post(`${API_BASE}/validate-login`, {
        login,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get available roles
  static async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get("/api/admin/roles");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get available organizations
  static async getOrganizations(
    search?: string
  ): Promise<ApiResponse<Organization[]>> {
    try {
      const params = search ? { search } : {};
      const response = await api.get("/api/admin/organizations", {
        params,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get available districts
  static async getDistricts(): Promise<ApiResponse<District[]>> {
    try {
      const response = await api.get("/api/admin/districts");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      byRole: Record<string, number>;
      byOrganization: Record<string, number>;
    }>
  > {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Import users from file
  static async importUsers(file: File): Promise<
    ApiResponse<{
      imported: number;
      errors: Array<{ row: number; error: string }>;
    }>
  > {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(`${API_BASE}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
        message: `Импорт завершен. Импортировано пользователей: ${response.data.imported}`,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Export users to file
  static async exportUsers(
    filters?: UserTableParams["filters"]
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await api.get(`${API_BASE}/export`, {
        params: filters,
        responseType: "blob",
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Activate/deactivate user
  static async toggleUserStatus(
    userId: string,
    status: "active" | "inactive"
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch(`${API_BASE}/${userId}/status`, {
        status,
      });
      return {
        success: true,
        data: response.data,
        message: `Пользователь ${
          status === "active" ? "активирован" : "деактивирован"
        }`,
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Reset user password
  static async resetUserPassword(
    userId: string
  ): Promise<ApiResponse<{ temporaryPassword: string }>> {
    try {
      const response = await api.post(`${API_BASE}/${userId}/reset-password`);
      return {
        success: true,
        data: response.data,
        message: "Пароль пользователя сброшен",
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Send invitation email
  static async sendInvitation(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.post(`${API_BASE}/${userId}/send-invitation`);
      return {
        success: true,
        message: "Приглашение отправлено",
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  // Helper method to extract error message
  private static getErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return axiosError.response?.data?.message || "Произошла ошибка";
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Произошла неизвестная ошибка";
  }
}

// Role management service
export class RoleManagementService {
  private static API_BASE = "/api/admin/roles";

  // Get all roles
  static async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get(this.API_BASE);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: UserManagementService["getErrorMessage"](error),
      };
    }
  }

  // Get role by ID
  static async getRole(roleId: string): Promise<ApiResponse<Role>> {
    try {
      const response = await api.get(`${this.API_BASE}/${roleId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: UserManagementService["getErrorMessage"](error),
      };
    }
  }

  // Create new role
  static async createRole(
    roleData: Omit<Role, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Role>> {
    try {
      const response = await api.post(this.API_BASE, roleData);
      return {
        success: true,
        data: response.data,
        message: "Роль успешно создана",
      };
    } catch (error) {
      return {
        success: false,
        error: UserManagementService["getErrorMessage"](error),
      };
    }
  }

  // Update role
  static async updateRole(
    roleId: string,
    roleData: Partial<Role>
  ): Promise<ApiResponse<Role>> {
    try {
      const response = await api.patch(`${this.API_BASE}/${roleId}`, roleData);
      return {
        success: true,
        data: response.data,
        message: "Роль успешно обновлена",
      };
    } catch (error) {
      return {
        success: false,
        error: UserManagementService["getErrorMessage"](error),
      };
    }
  }

  // Delete role
  static async deleteRole(roleId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`${this.API_BASE}/${roleId}`);
      return {
        success: true,
        message: "Роль успешно удалена",
      };
    } catch (error) {
      return {
        success: false,
        error: UserManagementService["getErrorMessage"](error),
      };
    }
  }
}
