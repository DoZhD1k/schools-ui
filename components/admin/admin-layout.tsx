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
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Settings className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Панель администратора</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-3 text-sm rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-primary-foreground/20"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
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
    <div className="min-h-screen bg-background">
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
