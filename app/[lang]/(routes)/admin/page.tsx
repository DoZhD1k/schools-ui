"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Users,
  Shield,
  Settings,
  Activity,
  School,
  BarChart3,
  MapPin,
  LogOut,
  Database,
  UserPlus,
  Eye,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface AdminPageProps {
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

// Статистические карточки
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: "up" | "down";
  trendValue?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  trendValue,
}: StatCardProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-200/50";
      case "warning":
        return "from-amber-500/20 to-orange-600/20 border-amber-200/50";
      case "danger":
        return "from-red-500/20 to-rose-600/20 border-red-200/50";
      default:
        return "from-blue-500/20 to-indigo-600/20 border-blue-200/50";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getVariantClass()} backdrop-blur-md rounded-3xl`}
      ></div>
      <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
      <div className="relative p-6 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

function AdminPage({ params }: AdminPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Администратор");
  const [stats] = useState({
    totalUsers: 152,
    activeUsers: 134,
    totalRoles: 5,
    totalSchools: 287,
  });

  useEffect(() => {
    // Извлекаем имя пользователя из токена
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
    // Имитируем загрузку данных
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Shield className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Панель администратора
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Управление системой
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
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-20"></div>
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

      {/* Welcome Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-slate-700/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/7 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        <div className="relative px-6 py-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Добро пожаловать, {userName}!
                </h1>
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  Панель администратора для управления системой образовательных
                  учреждений. Контролируйте пользователей, настраивайте права
                  доступа и отслеживайте активность.
                </p>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm font-medium">
                      Система защищена
                    </span>
                  </div>
                  <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    Последний вход: {new Date().toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] shadow-md"></div>
                  <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] flex items-center justify-center shadow-sm">
                    {/* <Shield className="h-16 w-16 text-white/90" /> */}
                    <Image
                      src="/images/shield.png"
                      alt="Shield"
                      width={300}
                      height={300}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Всего пользователей"
            value={stats.totalUsers.toLocaleString()}
            subtitle="Зарегистрированных в системе"
            icon={<Users className="h-6 w-6" />}
            variant="default"
            trend="up"
            trendValue="+8.2%"
          />

          <StatCard
            title="Активные пользователи"
            value={stats.activeUsers}
            subtitle="В системе сейчас"
            icon={<Activity className="h-6 w-6" />}
            variant="success"
            trend="up"
            trendValue="+5.1%"
          />

          <StatCard
            title="Ролей в системе"
            value={stats.totalRoles}
            subtitle="Настроенных ролей"
            icon={<Shield className="h-6 w-6" />}
            variant="warning"
          />

          <StatCard
            title="Образовательных учреждений"
            value={stats.totalSchools}
            subtitle="Под управлением"
            icon={<School className="h-6 w-6" />}
            variant="default"
            trend="up"
            trendValue="+2.3%"
          />
        </div>

        {/* Admin Actions */}
        <div className="mb-12">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                Административные функции
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link href={`/${params.lang}/admin/users`}>
                  <div className="group text-center cursor-pointer">
                    <div className="relative mb-4 mx-auto">
                      <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(59,130,246,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Управление пользователями
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Добавляйте, редактируйте и удаляйте пользователей
                    </p>
                    <div className="text-lg font-bold text-blue-600">
                      {stats.totalUsers}
                    </div>
                    <div className="text-sm text-slate-500">
                      активных пользователей
                    </div>
                  </div>
                </Link>

                <Link href={`/${params.lang}/admin/roles`}>
                  <div className="group text-center cursor-pointer">
                    <div className="relative mb-4 mx-auto">
                      <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(147,51,234,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Роли и права доступа
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Настраивайте права доступа и роли пользователей
                    </p>
                    <div className="text-lg font-bold text-purple-600">
                      {stats.totalRoles}
                    </div>
                    <div className="text-sm text-slate-500">
                      настроенных ролей
                    </div>
                  </div>
                </Link>

                <Link href={`/${params.lang}/admin/weights`}>
                  <div className="group text-center cursor-pointer">
                    <div className="relative mb-4 mx-auto">
                      <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                        <Settings className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Настройки системы
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Конфигурация весов и параметров системы
                    </p>
                    <div className="text-lg font-bold text-emerald-600">
                      Активно
                    </div>
                    <div className="text-sm text-slate-500">
                      система настроена
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* User Management */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/90 rounded-3xl"></div>
            <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative p-8 text-white transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Добавить пользователя</h3>
                    <p className="text-white/80 text-sm">
                      Быстрое создание учетной записи
                    </p>
                  </div>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Создайте новую учетную запись пользователя, назначьте роль и
                  настройте права доступа к системе.
                </p>
                <Link href={`/${params.lang}/admin/users/add`}>
                  <Button
                    className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                    size="lg"
                  >
                    Создать пользователя
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* View Users */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/90 rounded-3xl"></div>
            <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative p-8 text-white transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Просмотр пользователей
                    </h3>
                    <p className="text-white/80 text-sm">
                      Управление существующими записями
                    </p>
                  </div>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Просматривайте список всех пользователей, редактируйте их
                  данные и управляйте статусом активности.
                </p>
                <Link href={`/${params.lang}/admin/users`}>
                  <Button
                    className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                    size="lg"
                  >
                    Управление пользователями
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* School Forecast */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-600/90 rounded-3xl"></div>
            <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative p-8 text-white transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Прогноз дефицита</h3>
                    <p className="text-white/80 text-sm">
                      Аналитика школьных мест
                    </p>
                  </div>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">
                  Просмотрите прогноз дефицита и профицита школьных мест по
                  районам города с интерактивной картой.
                </p>
                <Link href={`/${params.lang}/schools/deficit`}>
                  <Button
                    className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                    size="lg"
                  >
                    Открыть прогноз
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-800/90 rounded-3xl"></div>
          <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
          <div className="relative rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/7 rounded-full blur-lg animate-pulse delay-2000"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Состояние системы</h3>
                  <p className="text-white/90 text-lg mb-4">
                    Мониторинг работы административной панели
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <div className="text-2xl font-bold text-green-400">
                        99.9%
                      </div>
                      <div className="text-sm text-white/80">Время работы</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <div className="text-2xl font-bold text-blue-400">
                        24/7
                      </div>
                      <div className="text-sm text-white/80">Доступность</div>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <div className="text-2xl font-bold text-amber-400">
                        Secure
                      </div>
                      <div className="text-sm text-white/80">Защита</div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-[hsl(0_0%_100%_/_0.1)] shadow-lg">
                    <Database className="h-16 w-16 text-white/90" />
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

export default withAuth(AdminPage);
