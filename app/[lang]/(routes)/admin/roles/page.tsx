"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Shield,
  BarChart3,
  MapPin,
  LogOut,
  ArrowLeft,
  Settings,
  Check,
  X,
  Edit,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface AdminRolesPageProps {
  params: { lang: string };
}

// Утилита для декодирования JWT токена
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Типы для ролей и разрешений
interface Permission {
  name: string;
  granted: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission[];
}

// Компонент карточки роли
const RoleCard = ({ role }: { role: Role }) => {
  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    );
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "Администратор":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Управление образования":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Организации образования":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-20"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
              <p className="text-sm text-slate-600">{role.description}</p>
              <div className="mt-2">
                <Badge
                  className={`text-xs font-medium border ${getRoleColor(
                    role.name
                  )}`}
                >
                  {role.userCount} пользователей
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-purple-50"
          >
            <Edit className="h-4 w-4 text-purple-600" />
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">
            Права доступа:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {role.permissions.map((permission: Permission, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-200/50"
              >
                <span className="text-sm font-medium text-slate-700">
                  {permission.name}
                </span>
                {getPermissionIcon(permission.granted)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminRolesPage({ params }: AdminRolesPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Администратор");
  const [roles] = useState([
    {
      id: 1,
      name: "Администратор",
      description: "Полный доступ ко всем функциям системы",
      userCount: 3,
      permissions: [
        { name: "Управление пользователями", granted: true },
        { name: "Управление ролями", granted: true },
        { name: "Системные настройки", granted: true },
        { name: "Просмотр аналитики", granted: true },
        { name: "Управление данными", granted: true },
        { name: "Экспорт отчетов", granted: true },
      ],
    },
    {
      id: 2,
      name: "Управление образования",
      description: "Доступ к управлению образовательными учреждениями",
      userCount: 25,
      permissions: [
        { name: "Управление пользователями", granted: true },
        { name: "Управление ролями", granted: false },
        { name: "Системные настройки", granted: false },
        { name: "Просмотр аналитики", granted: true },
        { name: "Управление данными", granted: true },
        { name: "Экспорт отчетов", granted: true },
      ],
    },
    {
      id: 3,
      name: "Организации образования",
      description: "Доступ к данным своего образовательного учреждения",
      userCount: 124,
      permissions: [
        { name: "Управление пользователями", granted: false },
        { name: "Управление ролями", granted: false },
        { name: "Системные настройки", granted: false },
        { name: "Просмотр аналитики", granted: true },
        { name: "Управление данными", granted: false },
        { name: "Экспорт отчетов", granted: false },
      ],
    },
  ]);

  useEffect(() => {
    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      if (decoded && decoded.sub) {
        const email = decoded.sub;
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:bg-slate-100/80 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Роли и права доступа
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  {roles.length} ролей настроено
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/${params.lang}/dashboard`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Главная
                </Button>
              </Link>
              <Link href={`/${params.lang}/map`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Карта
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-20"></div>
                  <Avatar className="relative h-9 w-9 bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)]">
                    <AvatarFallback className="bg-transparent text-slate-700 text-sm font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-700 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm border border-transparent hover:border-red-200/50 rounded-xl transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        {/* Action Bar */}
        <div className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Управление ролями
                  </h2>
                  <p className="text-slate-600">
                    Настройка прав доступа для различных ролей пользователей
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать роль
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="space-y-6">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-12">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 via-purple-800/90 to-indigo-800/90 rounded-3xl"></div>
            <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative rounded-3xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/7 rounded-full blur-lg animate-pulse delay-2000"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Система ролей и доступов
                    </h3>
                    <p className="text-white/90 text-lg mb-4">
                      Гибкая настройка прав доступа для обеспечения безопасности
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">{roles.length}</div>
                        <div className="text-sm text-white/80">
                          Активных ролей
                        </div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">
                          {roles.reduce((sum, role) => sum + role.userCount, 0)}
                        </div>
                        <div className="text-sm text-white/80">
                          Пользователей
                        </div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">6</div>
                        <div className="text-sm text-white/80">
                          Типов разрешений
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-[hsl(0_0%_100%_/_0.1)] shadow-lg">
                      <Settings className="h-16 w-16 text-white/90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(AdminRolesPage);
