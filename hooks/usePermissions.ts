/**
 * Permissions Hook
 * Hook для проверки прав доступа пользователя
 */

import { useAuth } from "@/contexts/auth-context";

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

export function usePermissions(): UserPermissions {
  const { isAdmin } = useAuth();

  // Администратор имеет все права
  if (isAdmin) {
    return {
      canInputData: true,
      canViewReports: true,
      canViewAnalytics: true,
      canFormRating: true,
      canManageUsers: true,
      canManageRoles: true,
      canViewAllData: true,
      canViewOwnData: true,
    };
  }

  // Права обычного пользователя (пока что ограниченные)
  // TODO: Получать права из роли пользователя когда будет реализована система профилей
  return {
    canInputData: false,
    canViewReports: false,
    canViewAnalytics: false,
    canFormRating: false,
    canManageUsers: false, // Только админы
    canManageRoles: false, // Только админы
    canViewAllData: false, // Только админы
    canViewOwnData: true, // Все могут видеть свои данные
  };
}

/**
 * Хук для получения отфильтрованных данных на основе прав доступа
 */
export function useDataFilter() {
  const { isAdmin } = useAuth();
  const permissions = usePermissions();

  return {
    /**
     * Фильтрует данные школ на основе прав пользователя
     */
    filterSchoolData: <T extends { school_id?: number }>(data: T[]): T[] => {
      // Админ видит все
      if (permissions.canViewAllData) {
        return data;
      }

      // Организация образования видит только свои школы
      // TODO: Реализовать когда будет система профилей пользователей
      if (permissions.canViewOwnData) {
        return data;
      }

      // По умолчанию ничего не показываем
      return [];
    },

    /**
     * Фильтрует пользователей на основе прав доступа
     */
    filterUserData: <T extends { school?: number }>(data: T[]): T[] => {
      // Админ видит всех
      if (permissions.canViewAllData) {
        return data;
      }

      // Организация образования видит только пользователей своей школы
      // TODO: Реализовать когда будет система профилей пользователей
      if (permissions.canViewOwnData) {
        return data;
      }

      return [];
    },

    /**
     * Проверяет, может ли пользователь редактировать данную запись
     */
    canEditRecord: (recordSchoolId?: number): boolean => {
      // Админ может редактировать все
      if (permissions.canViewAllData) {
        return true;
      }

      // TODO: Проверить принадлежность к школе пользователя
      return permissions.canInputData;
    },

    /**
     * Проверяет, может ли пользователь удалять данную запись
     */
    canDeleteRecord: (recordSchoolId?: number): boolean => {
      // Админ может удалять все
      if (permissions.canViewAllData) {
        return true;
      }

      // Обычные пользователи не могут удалять записи
      return false;
    },
  };
}
