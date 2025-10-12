"use client";

import React from "react";
import Link from "next/link";
import { BarChart3, MapPin, Trophy, School } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "ru";
  return (
    <header className="top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
      <div className="mx-auto px-4 py-4">
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
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/${lang}/dashboard`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Главная
              </Button>
            </Link>
            <Link href={`/${lang}/schools/rating`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Рейтинг школ
              </Button>
            </Link>
            <Link href={`/${lang}/schools/organizations`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <School className="h-4 w-4 mr-2" />
                Организации
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
          </div>
        </div>
      </div>
    </header>
  );
}
