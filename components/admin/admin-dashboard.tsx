"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Shield, Activity, TrendingUp, Plus, Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "purple";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200 dark:text-blue-400 dark:from-blue-900/40 dark:to-blue-800/40",
    green:
      "text-emerald-600 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:text-emerald-400 dark:from-emerald-900/40 dark:to-emerald-800/40",
    yellow:
      "text-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 dark:text-amber-400 dark:from-amber-900/40 dark:to-amber-800/40",
    purple:
      "text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200 dark:text-purple-400 dark:from-purple-900/40 dark:to-purple-800/40",
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white/80 to-slate-50/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          {title}
        </CardTitle>
        <div
          className={`p-3.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${colorClasses[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-semibold">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-3">
            <TrendingUp
              className={`h-4 w-4 mr-2 ${
                trend.isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% за месяц
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick actions component
const QuickActions = () => {
  const actions = [
    {
      title: "Добавить пользователя",
      description: "Создать новую учетную запись",
      href: "/admin/users/add",
      icon: Plus,
      color:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    },
    {
      title: "Просмотр пользователей",
      description: "Управление существующими пользователями",
      href: "/admin/users",
      icon: Eye,
      color:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    },
    {
      title: "Настройка ролей",
      description: "Управление правами доступа",
      href: "/admin/roles",
      icon: Shield,
      color:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    },
  ];

  return (
    <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
          Быстрые действия
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
          Часто используемые функции
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group flex items-center p-5 border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div
                className={`p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-all duration-300 ${action.color}`}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <div className="font-bold text-slate-900 dark:text-white">
                  {action.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {action.description}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

// Recent activity component
const RecentActivity = () => {
  const activities = [
    {
      id: "1",
      type: "user_created" as const,
      message: "Создан новый пользователь: Иван Иванов",
      timestamp: "2 часа назад",
      severity: "info" as const,
    },
    {
      id: "2",
      type: "role_updated" as const,
      message: 'Обновлены права доступа для роли "Управление образования"',
      timestamp: "5 часов назад",
      severity: "warning" as const,
    },
    {
      id: "3",
      type: "user_deactivated" as const,
      message: "Деактивирован пользователь: Петр Петров",
      timestamp: "1 день назад",
      severity: "error" as const,
    },
    {
      id: "4",
      type: "system_update" as const,
      message: "Выполнено обновление системы до версии 2.1.0",
      timestamp: "2 дня назад",
      severity: "success" as const,
    },
  ];

  const severityColors = {
    info: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 dark:border-blue-700",
    warning:
      "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300 dark:border-amber-700",
    error:
      "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-300 dark:border-red-700",
    success:
      "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300 dark:from-emerald-900/40 dark:to-emerald-800/40 dark:text-emerald-300 dark:border-emerald-700",
  };

  return (
    <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
          Последние действия
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
          Активность в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-start space-x-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Badge
                variant="secondary"
                className={`text-xs mt-1 px-3 py-1.5 rounded-lg font-semibold border ${
                  severityColors[activity.severity]
                }`}
              >
                {activity.type.replace("_", " ")}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// System health component
const SystemHealth = () => {
  return (
    <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
          Состояние системы
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 font-medium">
          Мониторинг ключевых показателей
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              Использование CPU
            </span>
            <span className="text-slate-900 dark:text-white">23%</span>
          </div>
          <Progress value={23} className="h-3 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              Использование памяти
            </span>
            <span className="text-slate-900 dark:text-white">67%</span>
          </div>
          <Progress value={67} className="h-3 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              Использование диска
            </span>
            <span className="text-slate-900 dark:text-white">45%</span>
          </div>
          <Progress value={45} className="h-3 bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Все сервисы работают нормально
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {} as Record<string, number>,
    byOrganization: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStats({
          total: 152,
          active: 134,
          inactive: 18,
          byRole: {
            Администратор: 3,
            "Управление образования": 25,
            "Организации образования": 124,
          },
          byOrganization: {
            'МБОУ "Школа №1"': 45,
            'МБОУ "Гимназия №5"': 38,
            'МБОУ "Лицей №3"': 31,
          },
        });
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Панель администратора
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-medium text-lg">
            Обзор системы и управление пользователями
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Всего пользователей"
            value={stats.total}
            description="Зарегистрированных в системе"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            color="blue"
          />

          <StatsCard
            title="Активные пользователи"
            value={stats.active}
            description="Пользователи со статусом 'Активный'"
            icon={Activity}
            trend={{ value: 5, isPositive: true }}
            color="green"
          />

          <StatsCard
            title="Неактивные пользователи"
            value={stats.inactive}
            description="Пользователи со статусом 'Неактивный'"
            icon={Users}
            trend={{ value: 3, isPositive: false }}
            color="yellow"
          />

          <StatsCard
            title="Ролей в системе"
            value={Object.keys(stats.byRole).length}
            description="Различных ролей пользователей"
            icon={Shield}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-10 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            <QuickActions />
            <SystemHealth />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <RecentActivity />

            {/* Role Distribution */}
            <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Распределение по ролям
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byRole).map(([role, count]) => (
                    <div
                      key={role}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-slate-700/30 border border-slate-200/60 dark:border-slate-600/60"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {role}
                      </span>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-bold">
                          {count}
                        </Badge>
                        <div className="w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(
                                (count / stats.total) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
