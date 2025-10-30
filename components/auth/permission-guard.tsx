/**
 * Permission Guard Component
 * Компонент для условного рендеринга на основе прав доступа
 */

"use client";

import { usePermissions, UserPermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  permission: keyof UserPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const permissions = usePermissions();

  if (permissions[permission]) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Компонент для отображения контента только для админов
 */
interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <PermissionGuard permission="canViewAllData" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Компонент для отображения контента для пользователей с правами на управление пользователями
 */
export function UserManagementGuard({
  children,
  fallback = null,
}: AdminOnlyProps) {
  return (
    <PermissionGuard permission="canManageUsers" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Компонент для отображения контента для пользователей с правами на управление ролями
 */
export function RoleManagementGuard({
  children,
  fallback = null,
}: AdminOnlyProps) {
  return (
    <PermissionGuard permission="canManageRoles" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
