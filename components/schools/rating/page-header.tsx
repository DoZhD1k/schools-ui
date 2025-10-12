"use client";

import React from "react";
import { School, BarChart3, MapPin, TrendingDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageHeaderProps {
  userName: string;
  onLogout: () => void;
  lang: string;
}

export const PageHeader = ({ onLogout, lang }: PageHeaderProps) => {
  return (
    <header className="hidden relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                <School className="h-6 w-6 text-slate-700" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Рейтинг школ</h1>
              <p className="text-sm text-slate-600 font-medium">
                Образовательные учреждения Алматы
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/${lang}/dashboard`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Главная
              </Button>
            </Link>
            <Link href={`/${lang}/map`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Карта
              </Button>
            </Link>
            <Link href={`/${lang}/schools/deficit`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Прогноз дефицита
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              {/* <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20"></div>
                <Avatar className="relative h-9 w-9 bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)]">
                  <AvatarFallback className="bg-transparent text-slate-700 text-sm font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div> */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
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
  );
};
