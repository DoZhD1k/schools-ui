// User Management Types for Admin Panel

export type UserStatus = "active" | "inactive";

export type UserRole =
  | "administrator"
  | "education_management"
  | "education_organization";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export type DataAccessLevel = "all" | "organization" | "personal";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  actions: PermissionAction[];
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // Permission IDs
  dataAccess: DataAccessLevel;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  district: string;
  address?: string;
}

export interface District {
  id: string;
  name: string;
  code?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  district: string;
  organization: string;
  department?: string;
  position?: string;
  login: string;
  status: UserStatus;
  role: string; // Role ID
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Form interfaces
export interface CreateUserForm {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  district: string;
  organization: string;
  department: string;
  position: string;
  login: string;
  password: string;
  status: UserStatus;
  role: string;
}

export interface UserFilters {
  search?: string; // Search in firstName, lastName, middleName
  loginSearch?: string;
  organization?: string;
  position?: string;
  district?: string;
  role?: string;
  status?: UserStatus;
}

export interface UserTableParams {
  page: number;
  pageSize: number;
  filters: UserFilters;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserTableResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Detailed user information for modal
export interface UserDetails extends User {
  roleDetails: Role;
  organizationDetails: Organization;
  districtDetails: District;
  permissions: Permission[];
}

// Form validation errors
export interface UserFormErrors {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  district?: string;
  organization?: string;
  login?: string;
  password?: string;
  role?: string;
  general?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginValidationResponse {
  isAvailable: boolean;
  suggestions?: string[];
}

// Permission matrix for role display
export interface PermissionMatrix {
  [categoryId: string]: {
    category: PermissionCategory;
    permissions: {
      [permissionId: string]: {
        permission: Permission;
        granted: boolean;
        actions: PermissionAction[];
      };
    };
  };
}

// Toast notification types
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Predefined roles configuration
export const SYSTEM_ROLES: Record<
  UserRole,
  Omit<Role, "id" | "createdAt" | "updatedAt">
> = {
  administrator: {
    name: "administrator",
    displayName: "Администратор",
    description:
      "Полный доступ ко всем функциям; управление пользователями и настройками",
    permissions: ["*"], // All permissions
    dataAccess: "all",
    isSystemRole: true,
  },
  education_management: {
    name: "education_management",
    displayName: "Управление образования",
    description: "Полный доступ ко всем функциям",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "analytics.view",
      "reports.view",
      "organizations.view",
    ],
    dataAccess: "all",
    isSystemRole: true,
  },
  education_organization: {
    name: "education_organization",
    displayName: "Организации образования (школы)",
    description:
      "Доступ к собственным данным, загрузке информации, просмотру аналитики",
    permissions: [
      "organizations.view",
      "organizations.edit",
      "data.upload",
      "analytics.view",
    ],
    dataAccess: "organization",
    isSystemRole: true,
  },
};

// Password validation rules
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};
