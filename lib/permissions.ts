// Permissions configuration for the admin panel

import { Permission, PermissionCategory } from "@/types/user-management";

// Permission categories
export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "users",
    name: "Управление пользователями",
    description:
      "Создание, редактирование и управление учетными записями пользователей",
  },
  {
    id: "organizations",
    name: "Управление организациями",
    description: "Работа с данными образовательных организаций",
  },
  {
    id: "analytics",
    name: "Аналитика и отчеты",
    description: "Просмотр аналитических данных и формирование отчетов",
  },
  {
    id: "data",
    name: "Управление данными",
    description: "Загрузка, импорт и экспорт данных",
  },
  {
    id: "system",
    name: "Администрирование системы",
    description: "Настройка системы, управление ролями и правами",
  },
];

// All available permissions
export const PERMISSIONS: Permission[] = [
  // User management permissions
  {
    id: "users.view",
    name: "Просмотр пользователей",
    description: "Просмотр списка пользователей и их данных",
    category: PERMISSION_CATEGORIES[0],
    actions: ["view"],
  },
  {
    id: "users.create",
    name: "Создание пользователей",
    description: "Создание новых учетных записей пользователей",
    category: PERMISSION_CATEGORIES[0],
    actions: ["create"],
  },
  {
    id: "users.edit",
    name: "Редактирование пользователей",
    description: "Изменение данных существующих пользователей",
    category: PERMISSION_CATEGORIES[0],
    actions: ["edit"],
  },
  {
    id: "users.delete",
    name: "Удаление пользователей",
    description: "Удаление учетных записей пользователей",
    category: PERMISSION_CATEGORIES[0],
    actions: ["delete"],
  },
  {
    id: "users.manage_roles",
    name: "Управление ролями пользователей",
    description: "Назначение и изменение ролей пользователей",
    category: PERMISSION_CATEGORIES[0],
    actions: ["edit"],
  },

  // Organizations permissions
  {
    id: "organizations.view",
    name: "Просмотр организаций",
    description: "Просмотр данных образовательных организаций",
    category: PERMISSION_CATEGORIES[1],
    actions: ["view"],
  },
  {
    id: "organizations.create",
    name: "Создание организаций",
    description: "Добавление новых образовательных организаций",
    category: PERMISSION_CATEGORIES[1],
    actions: ["create"],
  },
  {
    id: "organizations.edit",
    name: "Редактирование организаций",
    description: "Изменение данных образовательных организаций",
    category: PERMISSION_CATEGORIES[1],
    actions: ["edit"],
  },
  {
    id: "organizations.delete",
    name: "Удаление организаций",
    description: "Удаление образовательных организаций",
    category: PERMISSION_CATEGORIES[1],
    actions: ["delete"],
  },

  // Analytics permissions
  {
    id: "analytics.view",
    name: "Просмотр аналитики",
    description: "Доступ к аналитическим данным и дашбордам",
    category: PERMISSION_CATEGORIES[2],
    actions: ["view"],
  },
  {
    id: "analytics.export",
    name: "Экспорт аналитики",
    description: "Экспорт аналитических данных",
    category: PERMISSION_CATEGORIES[2],
    actions: ["view"],
  },
  {
    id: "reports.view",
    name: "Просмотр отчетов",
    description: "Просмотр готовых отчетов",
    category: PERMISSION_CATEGORIES[2],
    actions: ["view"],
  },
  {
    id: "reports.create",
    name: "Создание отчетов",
    description: "Создание пользовательских отчетов",
    category: PERMISSION_CATEGORIES[2],
    actions: ["create"],
  },

  // Data management permissions
  {
    id: "data.upload",
    name: "Загрузка данных",
    description: "Загрузка данных в систему",
    category: PERMISSION_CATEGORIES[3],
    actions: ["create"],
  },
  {
    id: "data.import",
    name: "Импорт данных",
    description: "Импорт данных из внешних источников",
    category: PERMISSION_CATEGORIES[3],
    actions: ["create"],
  },
  {
    id: "data.export",
    name: "Экспорт данных",
    description: "Экспорт данных из системы",
    category: PERMISSION_CATEGORIES[3],
    actions: ["view"],
  },
  {
    id: "data.validate",
    name: "Валидация данных",
    description: "Проверка и валидация загруженных данных",
    category: PERMISSION_CATEGORIES[3],
    actions: ["edit"],
  },

  // System administration permissions
  {
    id: "system.settings",
    name: "Настройки системы",
    description: "Изменение системных настроек",
    category: PERMISSION_CATEGORIES[4],
    actions: ["view", "edit"],
  },
  {
    id: "system.roles",
    name: "Управление ролями",
    description: "Создание и редактирование ролей",
    category: PERMISSION_CATEGORIES[4],
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "system.permissions",
    name: "Управление правами",
    description: "Настройка прав доступа",
    category: PERMISSION_CATEGORIES[4],
    actions: ["view", "edit"],
  },
  {
    id: "system.logs",
    name: "Системные логи",
    description: "Просмотр логов системы",
    category: PERMISSION_CATEGORIES[4],
    actions: ["view"],
  },
];

// Role-permission mappings
export const ROLE_PERMISSIONS = {
  administrator: [
    "*", // All permissions
  ],
  education_management: [
    "users.view",
    "users.create",
    "users.edit",
    "users.manage_roles",
    "organizations.view",
    "organizations.create",
    "organizations.edit",
    "analytics.view",
    "analytics.export",
    "reports.view",
    "reports.create",
    "data.upload",
    "data.import",
    "data.export",
    "data.validate",
  ],
  education_organization: [
    "organizations.view",
    "organizations.edit", // Own organization only
    "analytics.view", // Own data only
    "reports.view", // Own data only
    "data.upload", // Own data only
    "data.export", // Own data only
  ],
};

// Helper function to check if user has permission
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (userPermissions.includes("*")) {
    return true; // Admin has all permissions
  }
  return userPermissions.includes(requiredPermission);
}

// Helper function to get permissions by role
export function getPermissionsByRole(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

// Helper function to get permission details by ID
export function getPermissionById(
  permissionId: string
): Permission | undefined {
  return PERMISSIONS.find((p) => p.id === permissionId);
}

// Helper function to group permissions by category
export function groupPermissionsByCategory(
  permissionIds: string[]
): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};

  permissionIds.forEach((id) => {
    if (id === "*") {
      // For admin role, include all permissions
      PERMISSIONS.forEach((permission) => {
        const categoryId = permission.category.id;
        if (!grouped[categoryId]) {
          grouped[categoryId] = [];
        }
        grouped[categoryId].push(permission);
      });
      return;
    }

    const permission = getPermissionById(id);
    if (permission) {
      const categoryId = permission.category.id;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(permission);
    }
  });

  return grouped;
}
