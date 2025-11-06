// Типы ролей согласно API
export enum UserRole {
  ADMIN = 1,
  SCHOOL_ORGANIZATION = 2,
  EDUCATION_MANAGEMENT = 3,
}

export interface RolePermissions {
  id: number;
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

// Типы доступа к данным
export enum DataScope {
  OWN_SCHOOL_ONLY = "own_school", // Только своя школа
  ALL_SCHOOLS = "all_schools", // Все школы
  ADMIN_FULL = "admin_full", // Полный админский доступ
}

// Карта доступа к данным по ролям (это логика бизнеса, не меняется)
export const ROLE_DATA_SCOPE: Record<UserRole, DataScope> = {
  [UserRole.ADMIN]: DataScope.ADMIN_FULL,
  [UserRole.SCHOOL_ORGANIZATION]: DataScope.OWN_SCHOOL_ONLY,
  [UserRole.EDUCATION_MANAGEMENT]: DataScope.ALL_SCHOOLS,
};

// Функции для проверки разрешений
export class PermissionChecker {
  constructor(
    private userRole: UserRole,
    private userSchoolId?: number | null,
    private rolePermissions?: RolePermissions
  ) {}

  // Проверка базовых разрешений роли
  canInputData(): boolean {
    // Работаем только с данными из API
    return this.rolePermissions?.can_input_data ?? false;
  }

  canViewReports(): boolean {
    return this.rolePermissions?.can_view_reports ?? false;
  }

  canViewAnalytics(): boolean {
    return this.rolePermissions?.can_view_analytics ?? false;
  }

  canFormRating(): boolean {
    return this.rolePermissions?.can_form_rating ?? false;
  }

  // Проверка админских разрешений
  isAdmin(): boolean {
    return this.userRole === UserRole.ADMIN;
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  canManageRoles(): boolean {
    return this.isAdmin();
  }

  canManageAllSchools(): boolean {
    return this.isAdmin() || this.userRole === UserRole.EDUCATION_MANAGEMENT;
  }

  // Проверка доступа к конкретной школе
  canAccessSchool(schoolId: number): boolean {
    const scope = ROLE_DATA_SCOPE[this.userRole];

    switch (scope) {
      case DataScope.ADMIN_FULL:
        return true; // Админ может всё

      case DataScope.ALL_SCHOOLS:
        return true; // Управление образования - все школы

      case DataScope.OWN_SCHOOL_ONLY:
        // Организация образования - только своя школа
        return this.userSchoolId === schoolId;

      default:
        return false;
    }
  }

  // Проверка права редактирования данных школы
  canEditSchoolData(schoolId: string | number): boolean {
    const numericSchoolId =
      typeof schoolId === "string" ? parseInt(schoolId) : schoolId;

    // Админы могут редактировать любые школы
    if (this.isAdmin()) {
      return true;
    }

    // Организации образования могут редактировать только свои школы
    if (this.userRole === UserRole.SCHOOL_ORGANIZATION && this.canInputData()) {
      return this.canAccessSchool(numericSchoolId);
    }

    // Управление образования может редактировать все школы если есть права на ввод данных
    if (
      this.userRole === UserRole.EDUCATION_MANAGEMENT &&
      this.canInputData()
    ) {
      return true;
    }

    return false;
  }

  // Получить список доступных школ (для фильтрации)
  getAccessibleSchoolIds(allSchoolIds: number[]): number[] {
    const scope = ROLE_DATA_SCOPE[this.userRole];

    switch (scope) {
      case DataScope.ADMIN_FULL:
      case DataScope.ALL_SCHOOLS:
        return allSchoolIds; // Все школы

      case DataScope.OWN_SCHOOL_ONLY:
        return this.userSchoolId ? [this.userSchoolId] : []; // Только своя школа

      default:
        return [];
    }
  }

  // Проверка доступа к разделам меню
  canAccessSection(section: string): boolean {
    switch (section) {
      case "admin":
      case "admin-users":
      case "admin-roles":
        return this.canManageUsers();

      case "analytics":
        return this.canViewAnalytics();

      case "reports":
        return this.canViewReports();

      case "rating":
        return this.canFormRating();

      case "data-input":
        return this.canInputData();

      case "schools":
      case "map":
        return true; // Базовый доступ для всех

      default:
        return false;
    }
  }

  // Получить описание роли для UI
  getRoleDescription(): string {
    // Используем данные из API если есть
    if (this.rolePermissions) {
      return this.rolePermissions.name;
    }

    // Fallback к определению по ID роли
    switch (this.userRole) {
      case UserRole.ADMIN:
        return "Администратор";
      case UserRole.SCHOOL_ORGANIZATION:
        return "Организация образования";
      case UserRole.EDUCATION_MANAGEMENT:
        return "Управление образования";
      default:
        return "Неизвестная роль";
    }
  }

  // Получить область доступа к данным
  getDataScope(): DataScope {
    return ROLE_DATA_SCOPE[this.userRole];
  }
}

// Утилитарные функции
export function createPermissionChecker(
  roleId: number,
  schoolId?: number | null,
  rolePermissions?: RolePermissions
): PermissionChecker {
  const userRole = roleId as UserRole;
  return new PermissionChecker(userRole, schoolId, rolePermissions);
}

export function getRoleName(roleId: number): string {
  // Для получения названия роли нужно будет делать запрос к API
  // Или передавать название роли из другого места
  switch (roleId) {
    case UserRole.ADMIN:
      return "Администратор";
    case UserRole.SCHOOL_ORGANIZATION:
      return "Организация образования";
    case UserRole.EDUCATION_MANAGEMENT:
      return "Управление образования";
    default:
      return "Неизвестная роль";
  }
}

export function isValidRole(roleId: number): boolean {
  return Object.values(UserRole).includes(roleId);
}
