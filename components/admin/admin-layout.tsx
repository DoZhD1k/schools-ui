"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Shield, Settings, Home, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminNavigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Главная",
      href: "/admin",
      icon: Home,
      description: "Обзор и статистика",
    },
    {
      title: "Пользователи",
      href: "/admin/users",
      icon: Users,
      description: "Управление пользователями",
      badge: "Новые",
    },
    {
      title: "Роли и доступы",
      href: "/admin/roles",
      icon: Shield,
      description: "Настройка прав доступа",
    },
    {
      title: "Настройки",
      href: "/admin/settings",
      icon: Settings,
      description: "Конфигурация системы",
    },
  ];

  return (
    <Card className="w-80 border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Панель администратора
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-4 text-sm rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700 shadow-lg"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700/60"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div
                      className={cn(
                        "font-bold",
                        isActive
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-slate-900 dark:text-white"
                      )}
                    >
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg",
                        isActive
                          ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block w-80 min-h-screen p-6">
          <AdminNavigation />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
