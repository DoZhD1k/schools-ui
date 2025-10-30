// Типы данных для School Rating API согласно документации
// Base URL: https://admin.smartalmaty.kz/api/v1/institutions-monitoring/

// =================== AUTHENTICATION ===================
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

// =================== USER MANAGEMENT ===================
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string | null; // YYYY-MM-DD format
  position: string;
  role: number; // ID роли
  school: number | null; // ID школы, null для администраторов
  role_name: string; // Название роли
  school_name: string | null; // Название школы
  is_active: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  birth_date?: string; // YYYY-MM-DD format
  position: string;
  role: number; // ID роли
  school?: number | null; // ID школы, null для администраторов
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  birth_date?: string;
  position?: string;
  role?: number;
  school?: number | null;
  is_active?: boolean;
}

// =================== ROLE MANAGEMENT ===================
export interface Role {
  id: number;
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

export interface CreateRoleRequest {
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  can_input_data?: boolean;
  can_view_reports?: boolean;
  can_view_analytics?: boolean;
  can_form_rating?: boolean;
}

// =================== COMMON API TYPES ===================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// =================== PAGINATION ===================
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// =================== QUERY PARAMETERS ===================
export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: number;
  school?: number;
  is_active?: boolean;
}

export interface RoleQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// =================== HTTP ERROR CODES ===================
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

// =================== USER ROLES ENUM ===================
export enum UserRoles {
  ADMINISTRATOR = 1,
  EDUCATION_ORGANIZATION = 2,
}

export const USER_ROLE_NAMES = {
  [UserRoles.ADMINISTRATOR]: "Администратор",
  [UserRoles.EDUCATION_ORGANIZATION]: "Организация образования",
} as const;
