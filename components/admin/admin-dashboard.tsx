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
  const getIconClass = () => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
      case "yellow":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "purple":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <Card className="transition-colors hover:bg-accent/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${getIconClass()}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`h-3 w-3 mr-1 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
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
    },
    {
      title: "Просмотр пользователей",
      description: "Управление существующими пользователями",
      href: "/admin/users",
      icon: Eye,
    },
    {
      title: "Настройка ролей",
      description: "Управление правами доступа",
      href: "/admin/roles",
      icon: Shield,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Быстрые действия
        </CardTitle>
        <CardDescription>Часто используемые функции</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="flex items-center p-3 rounded-lg border bg-card/50 transition-colors hover:bg-accent/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mr-3">
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
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

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "warning":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "error":
        return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      case "success":
        return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Последние действия
        </CardTitle>
        <CardDescription>Активность в системе</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-card/50 transition-colors hover:bg-accent/50"
            >
              <Badge
                variant="secondary"
                className={`text-xs mt-1 ${getSeverityClass(
                  activity.severity
                )}`}
              >
                {activity.type.replace("_", " ")}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Состояние системы
        </CardTitle>
        <CardDescription>Мониторинг ключевых показателей</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Использование CPU</span>
            <span className="font-medium">23%</span>
          </div>
          <Progress value={23} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Использование памяти</span>
            <span className="font-medium">67%</span>
          </div>
          <Progress value={67} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Использование диска</span>
            <span className="font-medium">45%</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Панель администратора
        </h1>
        <p className="text-muted-foreground mt-2">
          Обзор системы и управление пользователями
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <QuickActions />
          <SystemHealth />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentActivity />

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Распределение по ролям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byRole).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border"
                  >
                    <span className="text-sm font-medium">{role}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-medium">
                        {count} ({Math.round((count / stats.total) * 100)}%)
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
