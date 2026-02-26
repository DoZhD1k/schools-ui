/**
 * Admin Layout
 * Общий layout для админ панели с навигацией
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/usePermissions";
import { AdminGuard } from "@/components/auth/role-guard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Users,
  UserCog,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PermissionChecker } from "@/lib/role-permissions";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const permissions = usePermissions();
  const pathname = usePathname();

  // Извлекаем язык из пути
  const pathSegments = pathname.split("/");
  const lang = pathSegments[1] || "ru";

  // Формируем меню в зависимости от разрешений
  const adminNavItems = [
    {
      href: `/${lang}/admin/users`,
      label: "Пользователи",
      icon: Users,
      description: "Управление пользователями системы",
      permission: (p: PermissionChecker | null) => p?.canManageUsers(),
    },
    {
      href: `/${lang}/admin/roles`,
      label: "Роли",
      icon: UserCog,
      description: "Настройка ролей и прав доступа",
      permission: (p: PermissionChecker | null) => p?.canManageRoles(),
    },
    // Добавляем новые пункты меню для разных ролей
    {
      href: `/${lang}/admin/analytics`,
      label: "Аналитика",
      icon: BarChart3,
      description: "Просмотр аналитических данных",
      permission: (p: PermissionChecker | null) => p?.canViewAnalytics(),
    },
    {
      href: `/${lang}/admin/reports`,
      label: "Отчеты",
      icon: FileText,
      description: "Формирование отчетов",
      permission: (p: PermissionChecker | null) => p?.canViewReports(),
    },
    {
      href: `/${lang}/admin/settings`,
      label: "Настройки",
      icon: Settings,
      description: "Системные настройки",
      permission: (p: PermissionChecker | null) => p?.isAdmin(),
    },
  ].filter((item) => item.permission(permissions)); // Фильтруем пункты по разрешениям

  const isActive = (href: string) => {
    return pathname === href;
  };

  // Показываем информацию о пользователе и его роли
  const getUserRoleInfo = () => {
    if (!userProfile) return null;

    // Приоритет названию роли из профиля пользователя, затем из permissions
    const roleDescription =
      userProfile.role_name ||
      permissions?.getRoleDescription() ||
      "Неизвестная роль";
    const dataScope = permissions?.getDataScope();

    let scopeText = "";
    switch (dataScope) {
      case "admin_full":
        scopeText = "Полный доступ";
        break;
      case "all_schools":
        scopeText = "Все школы";
        break;
      case "own_school":
        scopeText = userProfile.school_name || "Своя школа";
        break;
      default:
        scopeText = "Ограниченный доступ";
    }

    return (
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {userProfile.first_name} {userProfile.last_name}
          </div>
          <div className="text-gray-600">{roleDescription}</div>
          <div className="text-xs text-gray-500 mt-1">
            Область доступа: {scopeText}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminGuard
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Доступ запрещен
                </h3>
                <p className="text-gray-500">
                  У вас нет прав для доступа к админ панели
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile hamburger button */}
          <button
            className="md:hidden fixed top-[65px] left-3 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Меню админ панели"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-slate-700" />
            ) : (
              <Menu className="h-5 w-5 text-slate-700" />
            )}
          </button>

          {/* Боковое меню */}
          <div
            className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-sm border-r min-h-screen transform transition-transform duration-200 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                <div>
                  <h2 className="text-base md:text-lg font-semibold">
                    Админ панель
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Управление системой
                  </p>
                </div>
              </div>

              {/* Информация о пользователе */}
              {getUserRoleInfo()}

              <nav className="space-y-2">
                {adminNavItems.length > 0 ? (
                  adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Button
                          variant={active ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-3 ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-medium text-sm">
                                {item.label}
                              </div>
                              <div
                                className={`text-xs ${
                                  active
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Нет доступных разделов</p>
                  </div>
                )}
              </nav>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1 min-w-0">
            <div className="p-4 pt-14 md:pt-8 md:p-8">{children}</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
