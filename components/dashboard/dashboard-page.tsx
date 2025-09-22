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
  BarChart3,
  Settings,
  MapPin,
  LogOut,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Subtle animated background elements */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <BarChart3 className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Цифровой рейтинг школ
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Алматы, Казахстан
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Панель управления
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20"></div>
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90"></div>
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
                  Система управления образовательными учреждениями Казахстана.
                  Здесь вы можете отслеживать показатели, анализировать данные и
                  принимать обоснованные решения.
                </p>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm font-medium">
                      Система работает стабильно
                    </span>
                  </div>
                  <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    Последнее обновление:{" "}
                    {new Date().toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] shadow-md"></div>
                  <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] flex items-center justify-center shadow-sm overflow-hidden">
                    {/* <School className="h-16 w-16 text-white/90" /> */}
                    <Image
                      src="/images/school.png"
                      alt="3D-School Illustration"
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

        {/* Additional Info Banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-600/90 rounded-3xl"></div>
            {/* <div className="absolute inset-0 bg-[#d3edf9] rounded-3xl"></div> */}
            <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative rounded-3xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/7 rounded-full blur-lg animate-pulse delay-2000"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Цифровое образование
                    </h3>
                    <p className="text-white/90 text-lg mb-4">
                      Следите за развитием образовательной системы в режиме
                      реального времени
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">98.5%</div>
                        <div className="text-sm text-white/80">
                          Покрытие регионов
                        </div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">24/7</div>
                        <div className="text-sm text-white/80">Мониторинг</div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-2xl font-bold">2.5M+</div>
                        <div className="text-sm text-white/80">Учащихся</div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-[hsl(0_0%_100%_/_0.1)] shadow-lg">
                      {/* <BarChart3 className="h-16 w-16 text-white/90" /> */}
                      <Image
                        src="/images/supplies.png"
                        alt="School Supplies Illustration"
                        width={250}
                        height={250}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activities={stats.recentActivity} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Быстрые действия
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/90 rounded-3xl"></div>
                  <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="relative p-8 text-white transition-all duration-300 hover:scale-105">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            Интерактивная карта
                          </h3>
                          <p className="text-white/80 text-sm">
                            Географическая аналитика
                          </p>
                        </div>
                      </div>
                      <p className="text-white/90 mb-6 leading-relaxed">
                        Изучите распределение школ по регионам, анализируйте
                        показатели эффективности и принимайте обоснованные
                        решения на основе географических данных.
                      </p>
                      <Link href={`/${params.lang}/map`}>
                        <Button
                          className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                          size="lg"
                        >
                          Открыть карту
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600/90 rounded-3xl"></div>
                  <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="relative p-8 text-white transition-all duration-300 hover:scale-105">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            Панель управления
                          </h3>
                          <p className="text-white/80 text-sm">
                            Администрирование
                          </p>
                        </div>
                      </div>
                      <p className="text-white/90 mb-6 leading-relaxed">
                        Управляйте пользователями, настраивайте систему,
                        работайте с данными и контролируйте все аспекты
                        образовательной платформы.
                      </p>
                      <Link href={`/${params.lang}/admin`}>
                        <Button
                          className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                          size="lg"
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
        </div>

        {/* Educational Statistics Section */}
        <div className="mt-12">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                Ключевые показатели образования
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="relative mb-4 mx-auto">
                    <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(245,158,11,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Качество образования
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Средний балл ЕНТ по стране составляет
                  </p>
                  <div className="text-3xl font-bold text-amber-600">112.5</div>
                  <div className="text-sm text-slate-500">баллов из 140</div>
                </div>

                <div className="text-center group">
                  <div className="relative mb-4 mx-auto">
                    <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Охват образованием
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Процент детей, посещающих школу
                  </p>
                  <div className="text-3xl font-bold text-emerald-600">
                    99.2%
                  </div>
                  <div className="text-sm text-slate-500">от общего числа</div>
                </div>

                <div className="text-center group">
                  <div className="relative mb-4 mx-auto">
                    <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(59,130,246,0.25)] transform group-hover:scale-110 transition-transform duration-300">
                      <School className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Цифровизация
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Школы с современным оборудованием
                  </p>
                  <div className="text-3xl font-bold text-blue-600">87.3%</div>
                  <div className="text-sm text-slate-500">
                    полностью оснащены
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="mt-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
            <div className="relative px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Доступные сервисы
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="relative group px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-md rounded-2xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg hover:from-blue-500/30 hover:to-indigo-600/30 transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2 text-slate-700 font-medium">
                    <MapPin className="h-5 w-5" />
                    Карта школ
                  </span>
                </button>
                <button className="relative group px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-md rounded-2xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg hover:from-emerald-500/30 hover:to-teal-600/30 transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2 text-slate-700 font-medium">
                    <BarChart3 className="h-5 w-5" />
                    Аналитика
                  </span>
                </button>
                <button className="relative group px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-md rounded-2xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg hover:from-amber-500/30 hover:to-orange-600/30 transition-all duration-300 transform hover:scale-105">
                  <span className="relative flex items-center gap-2 text-slate-700 font-medium">
                    <FileText className="h-5 w-5" />
                    Отчёты
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);
