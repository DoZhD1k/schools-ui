/**
 * Mock Admin API Service
 * Сервис для работы с моковыми данными администрирования
 */

export interface Role {
  id: number;
  name: string;
  description?: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  can_input_data?: boolean;
  can_view_reports?: boolean;
  can_view_analytics?: boolean;
  can_form_rating?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  can_input_data?: boolean;
  can_view_reports?: boolean;
  can_view_analytics?: boolean;
  can_form_rating?: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  birth_date?: string;
  position: string;
  role: number;
  school?: number;
  role_name: string;
  school_name?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

class MockAdminApiService {
  // Моковые роли
  private mockRoles: Role[] = [
    {
      id: 1,
      name: "Администратор",
      can_input_data: true,
      can_view_reports: true,
      can_view_analytics: true,
      can_form_rating: true,
    },
    {
      id: 2,
      name: "Организация образования",
      can_input_data: true,
      can_view_reports: true,
      can_view_analytics: false,
      can_form_rating: false,
    },
    {
      id: 3,
      name: "Управление образования",
      can_input_data: false,
      can_view_reports: true,
      can_view_analytics: true,
      can_form_rating: true,
    },
  ];

  // Моковые пользователи
  private mockUsers: User[] = [
    {
      id: 1,
      email: "admin@test.com",
      first_name: "Админ",
      last_name: "Системы",
      patronymic: "Главный",
      position: "Главный администратор",
      role: 1,
      role_name: "Администратор",
      is_active: true,
    },
    {
      id: 2,
      email: "school_a@test.com",
      first_name: "Директор",
      last_name: "Школы",
      patronymic: "Иванович",
      birth_date: "1980-05-15",
      position: "Директор",
      role: 2,
      school: 19663,
      role_name: "Организация образования",
      school_name: "Тестовая Школа А",
      is_active: true,
    },
    {
      id: 3,
      email: "edu_dept@test.com",
      first_name: "Заведующий",
      last_name: "Управления",
      patronymic: "Петрович",
      birth_date: "1975-08-20",
      position: "Заведующий отделом",
      role: 3,
      role_name: "Управление образования",
      is_active: true,
    },
  ];

  private nextUserId = 4;

  /**
   * Получить список пользователей
   */
  async getUsers(params?: UserQueryParams): Promise<ApiResponse<User[]>> {
    await this.delay(500); // Имитация задержки сети

    try {
      let filteredUsers = [...this.mockUsers];

      // Фильтрация по поиску
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.email.toLowerCase().includes(searchLower) ||
            user.first_name.toLowerCase().includes(searchLower) ||
            user.last_name.toLowerCase().includes(searchLower) ||
            user.position.toLowerCase().includes(searchLower)
        );
      }

      // Фильтрация по роли
      if (params?.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === params.role
        );
      }

      // Фильтрация по активности
      if (params?.is_active !== undefined) {
        filteredUsers = filteredUsers.filter(
          (user) => user.is_active === params.is_active
        );
      }

      return {
        success: true,
        data: filteredUsers,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка получения пользователей",
      };
    }
  }

  /**
   * Получить список ролей
   */
  async getRoles(params?: RoleQueryParams): Promise<ApiResponse<Role[]>> {
    await this.delay(300); // Имитация задержки сети

    try {
      let filteredRoles = [...this.mockRoles];

      // Фильтрация по поиску
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredRoles = filteredRoles.filter((role) =>
          role.name.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: true,
        data: filteredRoles,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка получения ролей",
      };
    }
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    await this.delay(800); // Имитация задержки сети

    try {
      // Проверяем уникальность email
      const existingUser = this.mockUsers.find(
        (user) => user.email === userData.email
      );
      if (existingUser) {
        return {
          success: false,
          error: "Пользователь с таким email уже существует",
        };
      }

      // Находим роль
      const role = this.mockRoles.find((r) => r.id === userData.role);
      if (!role) {
        return {
          success: false,
          error: "Указанная роль не найдена",
        };
      }

      // Создаем нового пользователя
      const newUser: User = {
        id: this.nextUserId++,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        patronymic: userData.patronymic,
        birth_date: userData.birth_date,
        position: userData.position,
        role: userData.role,
        school: userData.school,
        role_name: role.name,
        school_name: userData.school ? `Школа №${userData.school}` : undefined,
        is_active: true,
      };

      this.mockUsers.push(newUser);

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка создания пользователя",
      };
    }
  }

  /**
   * Обновить пользователя
   */
  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    await this.delay(600); // Имитация задержки сети

    try {
      const userIndex = this.mockUsers.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          error: "Пользователь не найден",
        };
      }

      // Если обновляется email, проверяем уникальность
      if (
        userData.email &&
        userData.email !== this.mockUsers[userIndex].email
      ) {
        const existingUser = this.mockUsers.find(
          (user) => user.email === userData.email
        );
        if (existingUser) {
          return {
            success: false,
            error: "Пользователь с таким email уже существует",
          };
        }
      }

      // Если обновляется роль, находим её название
      let roleName = this.mockUsers[userIndex].role_name;
      if (userData.role && userData.role !== this.mockUsers[userIndex].role) {
        const role = this.mockRoles.find((r) => r.id === userData.role);
        if (role) {
          roleName = role.name;
        }
      }

      // Обновляем пользователя
      this.mockUsers[userIndex] = {
        ...this.mockUsers[userIndex],
        ...userData,
        role_name: roleName,
        school_name: userData.school
          ? `Школа №${userData.school}`
          : this.mockUsers[userIndex].school_name,
      };

      return {
        success: true,
        data: this.mockUsers[userIndex],
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка обновления пользователя",
      };
    }
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: number): Promise<ApiResponse<void>> {
    await this.delay(500); // Имитация задержки сети

    try {
      const userIndex = this.mockUsers.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        return {
          success: false,
          error: "Пользователь не найден",
        };
      }

      this.mockUsers.splice(userIndex, 1);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка удаления пользователя",
      };
    }
  }

  /**
   * Создать роль
   */
  async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<Role>> {
    await this.delay(800); // Имитация задержки сети

    try {
      const newRole: Role = {
        id: Math.max(...this.mockRoles.map((r) => r.id)) + 1,
        name: roleData.name,
        description: roleData.description,
        can_input_data: roleData.can_input_data || false,
        can_view_reports: roleData.can_view_reports || false,
        can_view_analytics: roleData.can_view_analytics || false,
        can_form_rating: roleData.can_form_rating || false,
      };

      this.mockRoles.push(newRole);

      return {
        success: true,
        data: newRole,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка создания роли",
      };
    }
  }

  /**
   * Обновить роль
   */
  async updateRole(
    roleId: number,
    roleData: UpdateRoleRequest
  ): Promise<ApiResponse<Role>> {
    await this.delay(800); // Имитация задержки сети

    try {
      const roleIndex = this.mockRoles.findIndex((role) => role.id === roleId);
      if (roleIndex === -1) {
        return {
          success: false,
          error: "Роль не найдена",
        };
      }

      this.mockRoles[roleIndex] = {
        ...this.mockRoles[roleIndex],
        ...roleData,
      };

      return {
        success: true,
        data: this.mockRoles[roleIndex],
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка обновления роли",
      };
    }
  }

  /**
   * Удалить роль
   */
  async deleteRole(roleId: number): Promise<ApiResponse<void>> {
    await this.delay(500); // Имитация задержки сети

    try {
      const roleIndex = this.mockRoles.findIndex((role) => role.id === roleId);
      if (roleIndex === -1) {
        return {
          success: false,
          error: "Роль не найдена",
        };
      }

      this.mockRoles.splice(roleIndex, 1);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Ошибка удаления роли",
      };
    }
  }

  /**
   * Имитация задержки сети
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockAdminApiService = new MockAdminApiService();
