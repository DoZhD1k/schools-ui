"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  DashboardService,
  type DashboardStats,
} from "@/services/dashboard.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { School, Trophy, Users, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface DashboardPageProps {
  params: { lang: string };
}

function DashboardPage({ params }: DashboardPageProps) {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        const dashboardStats =
          await DashboardService.getDashboardStats(accessToken);
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
      {/* Subtle animated background elements — hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90"></div>
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative px-4 py-8 md:px-6 md:py-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="max-w-3xl">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                  Добро пожаловать!
                </h1>
                <p className="text-sm sm:text-base md:text-xl text-white/90 mb-4 md:mb-6 leading-relaxed">
                  Система управления образовательными учреждениями Казахстана.
                  <span className="hidden sm:inline">
                    {" "}
                    Здесь вы можете отслеживать показатели, анализировать данные
                    и принимать обоснованные решения.
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.6)]"></div>
                    <span className="text-xs md:text-sm font-medium">
                      Система работает
                    </span>
                  </div>
                  <div className="hidden sm:block text-xs md:text-sm bg-white/10 backdrop-blur-md rounded-full px-4 py-2 md:px-6 md:py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    Обновлено: {new Date().toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] shadow-md"></div>
                  <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] flex items-center justify-center shadow-sm overflow-hidden">
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

      <main className="relative container mx-auto px-4 py-6 md:px-6 md:py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
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
        <div className="mb-6 md:mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-600/90 rounded-2xl md:rounded-3xl"></div>
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
            <div className="relative rounded-2xl md:rounded-3xl p-5 md:p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse hidden md:block"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full blur-xl animate-pulse delay-1000 hidden md:block"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="w-full md:w-auto">
                    <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                      Цифровое образование
                    </h3>
                    <p className="text-white/90 text-sm md:text-lg mb-3 md:mb-4">
                      Следите за развитием образовательной системы в режиме
                      реального времени
                    </p>
                    <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:space-x-6">
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-lg md:text-2xl font-bold">
                          +80%
                        </div>
                        <div className="text-[10px] md:text-sm text-white/80">
                          Покрытие
                        </div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-lg md:text-2xl font-bold">
                          24/7
                        </div>
                        <div className="text-[10px] md:text-sm text-white/80">
                          Мониторинг
                        </div>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                        <div className="text-lg md:text-2xl font-bold">
                          {stats.totalStudents.toLocaleString()}
                        </div>
                        <div className="text-[10px] md:text-sm text-white/80">
                          Учащихся
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-[hsl(0_0%_100%_/_0.1)] shadow-lg">
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

        {/* Quick Actions */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-6">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-600/90 rounded-2xl md:rounded-3xl"></div>
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
              <div className="relative p-5 md:p-8 text-white transition-all duration-300 md:hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse hidden md:block"></div>
                <div className="relative">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md mr-3 md:mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <School className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold">
                        Организации образования
                      </h3>
                      <p className="text-white/80 text-xs md:text-sm">
                        Справочник школ
                      </p>
                    </div>
                  </div>
                  <p className="text-white/90 mb-4 md:mb-6 leading-relaxed text-sm md:text-base hidden sm:block">
                    Полная информация об образовательных учреждениях, их
                    характеристиках, контактных данных и показателях
                    деятельности.
                  </p>
                  <Link href={`/${params.lang}/schools/organizations`}>
                    <Button
                      className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                      size="lg"
                    >
                      Просмотреть школы
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-600/90 rounded-2xl md:rounded-3xl"></div>
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
              <div className="relative p-5 md:p-8 text-white transition-all duration-300 md:hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse hidden md:block"></div>
                <div className="relative">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md mr-3 md:mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold">
                        Рейтинг школ
                      </h3>
                      <p className="text-white/80 text-xs md:text-sm">
                        Оценка эффективности
                      </p>
                    </div>
                  </div>
                  <p className="text-white/90 mb-4 md:mb-6 leading-relaxed text-sm md:text-base hidden sm:block">
                    Комплексная система оценки школ на основе академических
                    результатов, инфраструктуры и качества образования.
                  </p>
                  <Link href={`/${params.lang}/schools/rating`}>
                    <Button
                      className="w-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] text-white hover:bg-white/15 hover:border-[hsl(0_0%_100%_/_0.15)] font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                      size="lg"
                    >
                      Посмотреть рейтинги
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/90 rounded-2xl md:rounded-3xl"></div>
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
              <div className="relative p-5 md:p-8 text-white transition-all duration-300 md:hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse hidden md:block"></div>
                <div className="relative">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md mr-3 md:mr-4 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-xl font-bold">
                        Интерактивная карта
                      </h3>
                      <p className="text-white/80 text-xs md:text-sm">
                        Географическая аналитика
                      </p>
                    </div>
                  </div>
                  <p className="text-white/90 mb-4 md:mb-6 leading-relaxed text-sm md:text-base hidden sm:block">
                    Изучите распределение школ по регионам, анализируйте
                    показатели эффективности и принимайте обоснованные решения
                    на основе географических данных.
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
