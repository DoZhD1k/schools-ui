/**
 * Permissions Hook
 * Hook для проверки прав доступа пользователя на основе ролей
 */

import { useAuth } from "@/contexts/auth-context";
import {
  PermissionChecker,
  createPermissionChecker,
} from "@/lib/role-permissions";

// Хук для работы с разрешениями пользователя
export function usePermissions(): PermissionChecker | null {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return createPermissionChecker(user.role, user.school, user.rolePermissions);
}

// Хук для быстрой проверки доступа к разделу
export function useCanAccess(section: string): boolean {
  const permissions = usePermissions();
  return permissions?.canAccessSection(section) ?? false;
}

// Хук для проверки админских прав
export function useIsAdmin(): boolean {
  const permissions = usePermissions();
  return permissions?.isAdmin() ?? false;
}

// Хук для проверки доступа к школе
export function useCanAccessSchool(schoolId: number): boolean {
  const permissions = usePermissions();
  return permissions?.canAccessSchool(schoolId) ?? false;
}

// Хук для получения списка доступных школ
export function useAccessibleSchools(allSchoolIds: number[]): number[] {
  const permissions = usePermissions();
  return permissions?.getAccessibleSchoolIds(allSchoolIds) ?? [];
}

// Совместимость со старым API
export interface UserPermissions {
  canInputData: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canFormRating: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewAllData: boolean;
  canViewOwnData: boolean;
}

export function usePermissionsLegacy(): UserPermissions {
  const checker = usePermissions();

  if (!checker) {
    return {
      canInputData: false,
      canViewReports: false,
      canViewAnalytics: false,
      canFormRating: false,
      canManageUsers: false,
      canManageRoles: false,
      canViewAllData: false,
      canViewOwnData: false,
    };
  }

  return {
    canInputData: checker.canInputData(),
    canViewReports: checker.canViewReports(),
    canViewAnalytics: checker.canViewAnalytics(),
    canFormRating: checker.canFormRating(),
    canManageUsers: checker.canManageUsers(),
    canManageRoles: checker.canManageRoles(),
    canViewAllData: checker.canManageAllSchools(),
    canViewOwnData: true,
  };
}

/**
 * Хук для получения отфильтрованных данных на основе прав доступа
 */
export function useDataFilter() {
  const checker = usePermissions();

  return {
    /**
     * Фильтрует данные школ на основе прав пользователя
     */
    filterSchoolData: <T extends { school_id?: number }>(data: T[]): T[] => {
      if (!checker) return [];

      // Админ или управление образования видят все
      if (checker.canManageAllSchools()) {
        return data;
      }

      // Организация образования видит только свои школы
      return data.filter((item) => {
        const schoolId = item.school_id;
        return schoolId ? checker.canAccessSchool(schoolId) : false;
      });
    },

    /**
     * Фильтрует пользователей на основе прав доступа
     */
    filterUserData: <T extends { school?: number }>(data: T[]): T[] => {
      if (!checker) return [];

      // Админ видит всех
      if (checker.canManageUsers()) {
        return data;
      }

      // Управление образования видит всех пользователей
      if (checker.canManageAllSchools()) {
        return data;
      }

      // Организация образования видит только пользователей своей школы
      return data.filter((item) => {
        const schoolId = item.school;
        return schoolId ? checker.canAccessSchool(schoolId) : false;
      });
    },

    /**
     * Проверяет, может ли пользователь редактировать данную запись
     */
    canEditRecord: (recordSchoolId?: number): boolean => {
      if (!checker || !checker.canInputData()) return false;

      // Админ может редактировать все
      if (checker.canManageAllSchools()) {
        return true;
      }

      // Проверить доступ к школе
      return recordSchoolId ? checker.canAccessSchool(recordSchoolId) : false;
    },

    /**
     * Проверяет, может ли пользователь удалять данную запись
     */
    canDeleteRecord: (recordSchoolId?: number): boolean => {
      if (!checker) return false;

      // Админ может удалять все
      if (checker.canManageUsers()) {
        return true;
      }

      // Управление образования может удалять записи школ
      if (checker.canManageAllSchools()) {
        return true;
      }

      // Организация образования может удалять только свои записи
      return recordSchoolId ? checker.canAccessSchool(recordSchoolId) : false;
    },

    /**
     * Получить доступные школы для фильтрации
     */
    getAccessibleSchoolIds: (allSchoolIds: number[]): number[] => {
      if (!checker) return [];
      return checker.getAccessibleSchoolIds(allSchoolIds);
    },
  };
}
