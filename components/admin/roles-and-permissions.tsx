"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Eye,
  Check,
  X,
  Edit,
  UserCheck,
  Crown,
  Lock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { TooltipProvider } from "../ui/tooltip";

import {
  Role,
  Permission,
  PermissionCategory,
} from "../../types/user-management";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  getPermissionsByRole,
  groupPermissionsByCategory,
} from "../../lib/permissions";
import { cn } from "../../lib/utils";

// Enhanced Role card component
interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onClick: (role: Role) => void;
  userCount?: number;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isSelected,
  onClick,
  userCount,
}) => {
  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "administrator":
        return <Crown className="h-5 w-5 text-amber-600" />;
      case "moderator":
        return <Shield className="h-5 w-5 text-blue-600" />;
      case "user":
        return <Users className="h-5 w-5 text-emerald-600" />;
      default:
        return <UserCheck className="h-5 w-5 text-slate-600" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "administrator":
        return "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-700";
      case "moderator":
        return "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700";
      case "user":
        return "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border-emerald-200 dark:border-emerald-700";
      default:
        return "from-slate-100 to-gray-100 dark:from-slate-800/30 dark:to-gray-800/30 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        "bg-gradient-to-br backdrop-blur-sm border-2",
        getRoleColor(role.name),
        isSelected &&
          "ring-4 ring-blue-500/50 ring-offset-2 shadow-2xl scale-105"
      )}
      onClick={() => onClick(role)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-3">
            {getRoleIcon(role.name)}
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {role.displayName}
              </div>
              <div className="text-sm font-normal text-slate-600 dark:text-slate-400">
                {role.name}
              </div>
            </div>
          </CardTitle>
          <div className="flex flex-col gap-2">
            {role.isSystemRole && (
              <Badge
                variant="outline"
                className="text-xs bg-red-50 border-red-200 text-red-700"
              >
                <Lock className="h-3 w-3 mr-1" />
                Системная
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                role.dataAccess === "all" &&
                  "bg-purple-50 border-purple-200 text-purple-700",
                role.dataAccess === "organization" &&
                  "bg-blue-50 border-blue-200 text-blue-700",
                role.dataAccess === "personal" &&
                  "bg-green-50 border-green-200 text-green-700"
              )}
            >
              {role.dataAccess === "all"
                ? "Все данные"
                : role.dataAccess === "organization"
                ? "Организация"
                : "Личные"}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {role.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-lg">
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {userCount || 0}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              пользователей
            </span>
          </div>

          {!role.isSystemRole && (
            <Button
              variant="outline"
              size="sm"
              className="bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                // Handle role editing
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Permissions matrix component
interface PermissionsMatrixProps {
  selectedRole: Role | null;
  permissions: Permission[];
  categories: PermissionCategory[];
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({
  selectedRole,
  permissions,
  categories,
}) => {
  if (!selectedRole) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40 rounded-full w-fit mx-auto">
              <Eye className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Выберите роль
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Выберите роль слева для просмотра детальных прав доступа
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rolePermissions = getPermissionsByRole(selectedRole.name);
  const groupedPermissions = groupPermissionsByCategory(rolePermissions);
  const isAdmin = selectedRole.name === "administrator";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {selectedRole.displayName}
              </div>
              <div className="text-blue-100 text-sm font-normal">
                {selectedRole.description}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Permissions Content */}
      <Card className="bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-800 dark:to-slate-900/60 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
        <CardContent className="p-6">
          {isAdmin ? (
            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                  <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                    Полный доступ администратора
                  </h4>
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Администратор имеет неограниченный доступ ко всем функциям
                    системы, включая управление пользователями, ролями и
                    настройками безопасности.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryPermissions = permissions.filter(
                  (p) => p.category.id === category.id
                );
                const grantedPermissions =
                  groupedPermissions[category.id] || [];
                const grantedCount = categoryPermissions.filter((permission) =>
                  grantedPermissions.some((gp) => gp.id === permission.id)
                ).length;

                return (
                  <div key={category.id} className="space-y-4">
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {category.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {category.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "bg-white dark:bg-slate-800 font-semibold",
                              grantedCount === categoryPermissions.length
                                ? "border-green-200 text-green-700 dark:border-green-700 dark:text-green-400"
                                : grantedCount > 0
                                ? "border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                                : "border-red-200 text-red-700 dark:border-red-700 dark:text-red-400"
                            )}
                          >
                            {grantedCount} из {categoryPermissions.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid gap-3">
                      {categoryPermissions.map((permission) => {
                        const isGranted = grantedPermissions.some(
                          (gp) => gp.id === permission.id
                        );

                        return (
                          <div
                            key={permission.id}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-all duration-200",
                              isGranted
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
                                : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                                    isGranted
                                      ? "bg-green-500 text-white shadow-lg"
                                      : "bg-red-500 text-white shadow-lg"
                                  )}
                                >
                                  {isGranted ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {permission.name}
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {permission.description}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {permission.actions.map((action) => (
                                  <Badge
                                    key={action}
                                    variant="outline"
                                    className={cn(
                                      "text-xs font-medium",
                                      isGranted
                                        ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
                                        : "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                                    )}
                                  >
                                    {action === "view"
                                      ? "Просмотр"
                                      : action === "create"
                                      ? "Создание"
                                      : action === "edit"
                                      ? "Редактирование"
                                      : action === "delete"
                                      ? "Удаление"
                                      : action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main roles and permissions component
export default function RolesAndPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load roles data
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Mock data for system roles
        const mockRoles: Role[] = [
          {
            id: "role-1",
            name: "administrator",
            displayName: "Администратор",
            description:
              "Полный доступ ко всем функциям; управление пользователями и настройками",
            permissions: ["*"],
            dataAccess: "all",
            isSystemRole: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "role-2",
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "role-3",
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        setRoles(mockRoles);

        // Auto-select first role
        if (mockRoles.length > 0) {
          setSelectedRole(mockRoles[0]);
        }
      } catch {
        setError("Не удалось загрузить роли");
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Роли и доступы</h2>
          <p className="text-gray-600">
            Управление ролями пользователей и матрицей прав доступа
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Роли</h3>
              <Badge variant="outline">
                {roles.length} {roles.length === 1 ? "роль" : "ролей"}
              </Badge>
            </div>

            {roles.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Shield className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="text-gray-500">Роли не найдены</p>
                    <Button variant="outline" size="sm">
                      Добавить роль
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedRole?.id === role.id}
                    onClick={handleRoleSelect}
                    userCount={0} // TODO: Load actual user count
                  />
                ))}
              </div>
            )}
          </div>

          {/* Permissions Matrix Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Права доступа</h3>

            <PermissionsMatrix
              selectedRole={selectedRole}
              permissions={PERMISSIONS}
              categories={PERMISSION_CATEGORIES}
            />
          </div>
        </div>

        {/* Data Access Levels Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Уровни доступа к данным</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Badge variant="default">Все данные</Badge>
                <p className="text-sm text-gray-600">
                  Полный доступ ко всем данным в системе без ограничений
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Данные организации</Badge>
                <p className="text-sm text-gray-600">
                  Доступ только к данным своей образовательной организации
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Личные данные</Badge>
                <p className="text-sm text-gray-600">
                  Доступ только к собственным персональным данным
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
