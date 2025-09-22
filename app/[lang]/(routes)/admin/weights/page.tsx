"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Settings,
  BarChart3,
  MapPin,
  LogOut,
  ArrowLeft,
  Sliders,
  Save,
  RotateCcw,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";

interface AdminWeightsPageProps {
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

interface WeightSetting {
  id: string;
  name: string;
  description: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
}

// Компонент настройки веса
const WeightControl = ({
  setting,
  onChange,
}: {
  setting: WeightSetting;
  onChange: (id: string, value: number) => void;
}) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">{setting.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{setting.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {setting.value}
              {setting.unit && (
                <span className="text-sm text-slate-500 ml-1">
                  {setting.unit}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Slider
            value={[setting.value]}
            onValueChange={(value) => onChange(setting.id, value[0])}
            max={setting.max}
            min={setting.min}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {setting.min}
              {setting.unit}
            </span>
            <span>
              {setting.max}
              {setting.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminWeightsPage({ params }: AdminWeightsPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Администратор");
  const [hasChanges, setHasChanges] = useState(false);
  const [weights, setWeights] = useState<WeightSetting[]>([
    {
      id: "academic_performance",
      name: "Академическая успеваемость",
      description: "Вес показателей успеваемости учащихся",
      value: 35,
      min: 0,
      max: 100,
      unit: "%",
    },
    {
      id: "infrastructure",
      name: "Инфраструктура",
      description: "Качество материально-технической базы",
      value: 25,
      min: 0,
      max: 100,
      unit: "%",
    },
    {
      id: "teaching_quality",
      name: "Качество преподавания",
      description: "Квалификация и опыт педагогического состава",
      value: 30,
      min: 0,
      max: 100,
      unit: "%",
    },
    {
      id: "extracurricular",
      name: "Внеучебная деятельность",
      description: "Спортивные и творческие достижения",
      value: 10,
      min: 0,
      max: 100,
      unit: "%",
    },
  ]);

  useEffect(() => {
    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      if (decoded && decoded.sub) {
        const email = decoded.sub;
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  }, [accessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleWeightChange = (id: string, value: number) => {
    setWeights((prev) => prev.map((w) => (w.id === id ? { ...w, value } : w)));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log("Saving weights:", weights);
    setHasChanges(false);
    // Здесь будет логика сохранения
  };

  const handleReset = () => {
    // Сброс к значениям по умолчанию
    setWeights([
      {
        id: "academic_performance",
        name: "Академическая успеваемость",
        description: "Вес показателей успеваемости учащихся",
        value: 35,
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "infrastructure",
        name: "Инфраструктура",
        description: "Качество материально-технической базы",
        value: 25,
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "teaching_quality",
        name: "Качество преподавания",
        description: "Квалификация и опыт педагогического состава",
        value: 30,
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "extracurricular",
        name: "Внеучебная деятельность",
        description: "Спортивные и творческие достижения",
        value: 10,
        min: 0,
        max: 100,
        unit: "%",
      },
    ]);
    setHasChanges(false);
  };

  const totalWeight = weights.reduce((sum, w) => sum + w.value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:bg-slate-100/80 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Sliders className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Настройки весов
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Конфигурация параметров рейтинга
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/${params.lang}/dashboard`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Главная
                </Button>
              </Link>
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
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur opacity-20"></div>
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

      <main className="relative container mx-auto px-6 py-12">
        {/* Control Panel */}
        <div className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Управление весами параметров
                  </h2>
                  <p className="text-slate-600">
                    Настройте важность различных критериев для расчета рейтинга
                    школ
                  </p>
                  <div className="mt-2">
                    <span
                      className={`text-sm font-medium ${
                        totalWeight === 100 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Общий вес: {totalWeight}%{" "}
                      {totalWeight !== 100 && "(должно быть 100%)"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {hasChanges && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={totalWeight !== 100}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {weights.map((weight) => (
            <WeightControl
              key={weight.id}
              setting={weight}
              onChange={handleWeightChange}
            />
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-md rounded-3xl border border-blue-200/50"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(59,130,246,0.25)]">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Академические показатели
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {weights.find((w) => w.id === "academic_performance")?.value}%
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Самый важный критерий
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-md rounded-3xl border border-emerald-200/50"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(16,185,129,0.25)]">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Качество обучения
              </h3>
              <div className="text-3xl font-bold text-emerald-600">
                {weights.find((w) => w.id === "teaching_quality")?.value}%
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Квалификация педагогов
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-md rounded-3xl border border-amber-200/50"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(245,158,11,0.25)]">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Общий баланс
              </h3>
              <div
                className={`text-3xl font-bold ${
                  totalWeight === 100 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {totalWeight}%
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {totalWeight === 100
                  ? "Идеальный баланс"
                  : "Требует корректировки"}
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 via-emerald-800/90 to-teal-800/90 rounded-3xl"></div>
          <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
          <div className="relative rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/7 rounded-full blur-lg animate-pulse delay-2000"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Система оценки школ
                  </h3>
                  <p className="text-white/90 text-lg mb-4">
                    Настройте веса параметров для справедливого и точного
                    рейтинга
                  </p>
                  <div className="space-y-2 text-white/90">
                    <p>
                      • Академическая успеваемость - результаты ЕНТ и олимпиад
                    </p>
                    <p>• Инфраструктура - материально-техническая база</p>
                    <p>• Качество преподавания - квалификация педагогов</p>
                    <p>• Внеучебная деятельность - спорт и творчество</p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-[hsl(0_0%_100%_/_0.1)] shadow-lg">
                    <Settings className="h-16 w-16 text-white/90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(AdminWeightsPage);
