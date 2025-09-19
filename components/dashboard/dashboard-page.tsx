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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-6">
              <div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                      Добро пожаловать, {userName}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Система управления образовательными учреждениями
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
                  className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Карта
                </Button>
              </Link>
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Панель управления
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <StatCard
            title="Всего школ"
            value={stats.totalSchools.toLocaleString()}
            subtitle="Образовательных учреждений"
            icon={<School className="h-6 w-6" />}
            variant="default"
          />

          <StatCard
            title="Лидирующие школы"
            value={stats.leadingSchools}
            subtitle="С высоким рейтингом"
            icon={<Trophy className="h-6 w-6" />}
            variant="success"
            trend="up"
            trendValue="+12%"
          />

          <StatCard
            title="Учащиеся"
            value={stats.totalStudents.toLocaleString()}
            subtitle="Общее количество"
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />

          <StatCard
            title="Средний рейтинг"
            value={stats.averageRating.toFixed(1)}
            subtitle="Из 5.0"
            icon={<Star className="h-6 w-6" />}
            variant="warning"
            trend="up"
            trendValue="+0.2"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activities={stats.recentActivity} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Аналитика
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Интерактивная карта
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Просмотр детальной аналитики по школам, регионам и
                  образовательным показателям на интерактивной карте
                </p>
                <Link href={`/${params.lang}/map`}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    Открыть карту
                  </Button>
                </Link>
              </div>

              <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Управление
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Системные настройки
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Управление пользователями, школами, коллекциями данных и
                  системными настройками платформы
                </p>
                <Link href={`/${params.lang}/admin`}>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold py-3 rounded-xl transition-all duration-200"
                  >
                    Панель управления
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
