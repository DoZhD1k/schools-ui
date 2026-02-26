"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BarChart3, MapPin, Trophy, School, Menu, X, Home } from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "ru";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/${lang}/dashboard`, label: "Главная", icon: Home },
    { href: `/${lang}/schools/rating`, label: "Рейтинг", icon: Trophy },
    {
      href: `/${lang}/schools/organizations`,
      label: "Организации",
      icon: School,
    },
    { href: `/${lang}/map`, label: "Карта", icon: MapPin },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${lang}/dashboard`}
            className="flex items-center space-x-3 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-md">
                <BarChart3 className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <h1 className="text-base md:text-xl font-bold text-slate-800 truncate hidden sm:block">
              Цифровой рейтинг школ
            </h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "outline"}
                    size="sm"
                    className={
                      isActive(item.href)
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-white/90 shadow-sm transition-all duration-200"
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pb-1 border-t border-slate-200/60 pt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
