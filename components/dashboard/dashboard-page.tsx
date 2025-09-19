"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import {
  DashboardService,
  type DashboardStats,
} from "@/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  School,
  Trophy,
  Users,
  Star,
  GraduationCap,
  Database,
  BarChart3,
  Settings,
  MapPin,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface DashboardPageProps {
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

function DashboardPage({ params }: DashboardPageProps) {
  const { accessToken, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Пользователь");

  useEffect(() => {
    // Извлекаем имя пользователя из токена
    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      if (decoded && decoded.sub) {
        // Используем email как имя пользователя или можно добавить поле name в JWT
        const email = decoded.sub;
        const name = email.split("@")[0]; // Берем часть до @
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        const dashboardStats = await DashboardService.getDashboardStats(
          accessToken
        );
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Не удалось загрузить статистику");
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Добро пожаловать, {userName}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Управление образовательной платформой
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${params.lang}/map`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Карта
                </Button>
              </Link>
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Админ
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Всего школ"
            value={stats.totalSchools.toLocaleString()}
            subtitle="Образовательных учреждений"
            icon={<School className="h-5 w-5" />}
            variant="default"
          />

          <StatCard
            title="Лидирующие школы"
            value={stats.leadingSchools}
            subtitle="С высоким рейтингом"
            icon={<Trophy className="h-5 w-5" />}
            variant="success"
            trend="up"
            trendValue="+12%"
          />

          <StatCard
            title="Учащиеся"
            value={stats.totalStudents.toLocaleString()}
            subtitle="Общее количество"
            icon={<Users className="h-5 w-5" />}
            variant="default"
          />

          <StatCard
            title="Средний рейтинг"
            value={stats.averageRating.toFixed(1)}
            subtitle="Из 5.0"
            icon={<Star className="h-5 w-5" />}
            variant="warning"
            trend="up"
            trendValue="+0.2"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activities={stats.recentActivity} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-4">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Аналитика
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Интерактивная карта
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Просмотр детальной аналитики по школам, регионам и
                  образовательным показателям
                </p>
                <Link href={`/${params.lang}/map`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5">
                    Открыть карту
                  </Button>
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg mr-4">
                    <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Управление
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Системные настройки
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Управление пользователями, школами, коллекциями данных и
                  системными настройками
                </p>
                <Link href={`/${params.lang}/admin`}>
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 dark:border-slate-600 font-medium py-2.5"
                  >
                    Админ панель
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
