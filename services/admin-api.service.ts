import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://admin.smartalmaty.kz/api/v1";

// Типы для API
export interface Permission {
  id: number;
  name: string;
  codename: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  permission_ids: number[];
}

export interface SchoolProfile {
  patronymic: string;
  birth_date: string;
  district: number;
  organization: number;
  department: string;
  position: string;
  status: "active" | "inactive";
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  school_profile: SchoolProfile;
  roles: number[];
  date_joined?: string;
  status?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  school_profile: SchoolProfile;
  roles: number[];
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  school_profile?: SchoolProfile;
  roles?: number[];
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface RoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

export interface UserFilters {
  limit?: number;
  offset?: number;
  school_profile__district?: number;
  school_profile__organization?: number;
  school_profile__position?: string;
  search?: string;
}

class AdminApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Permissions API
  async getPermissions(): Promise<Permission[]> {
    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/permissions/`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async getPermission(id: number): Promise<Permission> {
    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/permissions/${id}/`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  // Roles API
  async getRoles(): Promise<RoleListResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/roles/`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async getRole(id: number): Promise<Role> {
    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/roles/${id}/`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    const response = await axios.post(
      `${API_BASE_URL}/school-rating-admin/roles/`,
      roleData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async updateRole(id: number, roleData: CreateRoleRequest): Promise<Role> {
    const response = await axios.put(
      `${API_BASE_URL}/school-rating-admin/roles/${id}/`,
      roleData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async partialUpdateRole(
    id: number,
    roleData: Partial<CreateRoleRequest>
  ): Promise<Role> {
    const response = await axios.patch(
      `${API_BASE_URL}/school-rating-admin/roles/${id}/`,
      roleData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async deleteRole(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/school-rating-admin/roles/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Users API
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/users/?${params.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await axios.get(
      `${API_BASE_URL}/school-rating-admin/users/${id}/`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await axios.post(
      `${API_BASE_URL}/school-rating-admin/users/`,
      userData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await axios.put(
      `${API_BASE_URL}/school-rating-admin/users/${id}/`,
      userData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async partialUpdateUser(
    id: number,
    userData: Partial<UpdateUserRequest>
  ): Promise<User> {
    const response = await axios.patch(
      `${API_BASE_URL}/school-rating-admin/users/${id}/`,
      userData,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/school-rating-admin/users/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }
}

export const adminApiService = new AdminApiService();
