import { ReactNode } from "react";
import { usePermissions, useCanAccess } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/auth-context";
import { PermissionChecker } from "@/lib/role-permissions";

interface RoleGuardProps {
  children: ReactNode;
  section?: string;
  fallback?: ReactNode;
  requiredPermission?: (checker: PermissionChecker) => boolean;
}

// Универсальный guard для проверки доступа по ролям
export function RoleGuard({
  children,
  section,
  fallback = null,
  requiredPermission,
}: RoleGuardProps) {
  const permissions = usePermissions();
  const hasAccess = useCanAccess(section || "");

  // Если не авторизован
  if (!permissions) {
    return <>{fallback}</>;
  }

  // Проверка кастомного разрешения
  if (requiredPermission && !requiredPermission(permissions)) {
    return <>{fallback}</>;
  }

  // Проверка доступа к разделу
  if (section && !hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Специализированные guards

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { isAdmin } = useAuth();
  const permissions = usePermissions();

  console.log("🛡️ AdminGuard check:", { isAdmin, permissions });

  // Используем обе проверки для надежности
  const hasAdminAccess = isAdmin || permissions?.isAdmin();

  if (!hasAdminAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
interface AnalyticsGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AnalyticsGuard({
  children,
  fallback = null,
}: AnalyticsGuardProps) {
  return (
    <RoleGuard
      requiredPermission={(checker) => checker.canViewAnalytics()}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

interface ReportsGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ReportsGuard({ children, fallback = null }: ReportsGuardProps) {
  return (
    <RoleGuard
      requiredPermission={(checker) => checker.canViewReports()}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

interface DataInputGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function DataInputGuard({
  children,
  fallback = null,
}: DataInputGuardProps) {
  return (
    <RoleGuard
      requiredPermission={(checker) => checker.canInputData()}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

interface RatingGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RatingGuard({ children, fallback = null }: RatingGuardProps) {
  return (
    <RoleGuard
      requiredPermission={(checker) => checker.canFormRating()}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}

interface SchoolDataGuardProps {
  children: ReactNode;
  schoolId: number;
  fallback?: ReactNode;
}

export function SchoolDataGuard({
  children,
  schoolId,
  fallback = null,
}: SchoolDataGuardProps) {
  return (
    <RoleGuard
      requiredPermission={(checker) => checker.canAccessSchool(schoolId)}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}
