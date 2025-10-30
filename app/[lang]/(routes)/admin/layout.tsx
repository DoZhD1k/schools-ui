/**
 * Admin Layout
 * Общий layout для админ панели с навигацией
 */

"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  // Извлекаем язык из пути
  const pathSegments = pathname.split("/");
  const lang = pathSegments[1] || "ru";

  const adminNavItems = [
    {
      href: `/${lang}/admin/users`,
      label: "Пользователи",
      icon: Users,
      description: "Управление пользователями системы",
    },
    {
      href: `/${lang}/admin/roles`,
      label: "Роли",
      icon: UserCog,
      description: "Настройка ролей и прав доступа",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Доступ запрещен
              </h3>
              <p className="text-gray-500">
                У вас нет прав для доступа к админ панели
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Боковое меню */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Админ панель</h2>
                <p className="text-sm text-muted-foreground">
                  Управление системой
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div
                            className={`text-xs ${
                              active
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
