"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Building2,
  Users,
  LogOut,
  ArrowLeft,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Map,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SchoolForecastPageProps {
  params: {
    lang: string;
  };
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

// Мок данные
const mockForecastData = {
  metrics: {
    deficitSchools: 24,
    surplusSchools: 18,
    totalDeficit: 3420,
    totalSurplus: 1850,
  },
  districts: [
    "Алмалинский район",
    "Ауэзовский район",
    "Бостандыкский район",
    "Жетысуский район",
    "Медеуский район",
    "Наурызбайский район",
    "Турксибский район",
  ],
  schools: [
    {
      id: 1,
      nameRu: "Школа-лицей №165 имени Гани Муратбаева",
      district: "Алмалинский район",
      type: "Государственная",
      capacity: 1400,
      students2024: 1250,
      students2025: 1320,
      deficit: -80,
      surplus: 0,
      rating: 4.5,
      zone: "deficit",
    },
    {
      id: 2,
      nameRu: "Гимназия №148",
      district: "Бостандыкский район",
      type: "Государственная",
      capacity: 1200,
      students2024: 980,
      students2025: 1050,
      deficit: 0,
      surplus: 150,
      rating: 4.8,
      zone: "surplus",
    },
    {
      id: 3,
      nameRu: "СОШ №95",
      district: "Ауэзовский район",
      type: "Государственная",
      capacity: 800,
      students2024: 750,
      students2025: 790,
      deficit: 0,
      surplus: 10,
      rating: 4.2,
      zone: "balanced",
    },
    {
      id: 4,
      nameRu: "Международная школа Хайлейбери",
      district: "Медеуский район",
      type: "Частная",
      capacity: 600,
      students2024: 420,
      students2025: 480,
      deficit: 0,
      surplus: 120,
      rating: 4.9,
      zone: "surplus",
    },
    {
      id: 5,
      nameRu: "СОШ №23",
      district: "Жетысуский район",
      type: "Государственная",
      capacity: 900,
      students2024: 850,
      students2025: 920,
      deficit: -20,
      surplus: 0,
      rating: 4.1,
      zone: "deficit",
    },
  ],
  demandForecast: [
    { year: 2024, demand: 45000, capacity: 42500 },
    { year: 2025, demand: 47200, capacity: 43200 },
    { year: 2026, demand: 49800, capacity: 44100 },
    { year: 2027, demand: 52100, capacity: 45500 },
    { year: 2028, demand: 54600, capacity: 47200 },
    { year: 2029, demand: 57300, capacity: 49100 },
    { year: 2030, demand: 60200, capacity: 51200 },
  ],
};

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: "up" | "down";
  trendValue?: string;
}

// Статистические карточки
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  trendValue,
}: StatCardProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-200/50";
      case "warning":
        return "from-amber-500/20 to-orange-600/20 border-amber-200/50";
      case "danger":
        return "from-red-500/20 to-rose-600/20 border-red-200/50";
      default:
        return "from-blue-500/20 to-indigo-600/20 border-blue-200/50";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getVariantClass()} backdrop-blur-md rounded-3xl`}
      ></div>
      <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
      <div className="relative p-6 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

function SchoolForecastPage({ params }: SchoolForecastPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Пользователь");
  const [viewMode, setViewMode] = useState<"polygons" | "schools">("schools");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2025");

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredSchools = mockForecastData.schools.filter((school) => {
    const matchesDistrict =
      selectedDistrict === "all" || school.district === selectedDistrict;
    const matchesSearch = school.nameRu
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRating =
      selectedRating === "all" ||
      (selectedRating === "high" && school.rating >= 4.5) ||
      (selectedRating === "medium" &&
        school.rating >= 4.0 &&
        school.rating < 4.5) ||
      (selectedRating === "low" && school.rating < 4.0);
    const matchesType =
      selectedType === "all" ||
      (selectedType === "public" && school.type === "Государственная") ||
      (selectedType === "private" && school.type === "Частная");

    return matchesDistrict && matchesSearch && matchesRating && matchesType;
  });

  const getZoneBadgeColor = (zone: string) => {
    switch (zone) {
      case "deficit":
        return "bg-red-100 text-red-800 border-red-200";
      case "surplus":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "balanced":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-slate-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <TrendingDown className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Прогноз дефицита школьных мест
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Аналитика и прогноз по загруженности школ
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
              <Link href={`/${params.lang}/schools/organizations`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />К списку школ
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20"></div>
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

      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/7 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        <div className="relative px-6 py-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Прогноз дефицита школьных мест
                </h1>
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  Комплексная аналитика и прогнозирование загруженности
                  образовательных учреждений с интерактивными картами и
                  детальной статистикой.
                </p>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(239,68,68,0.6)]"></div>
                    <span className="text-sm font-medium">
                      Анализ дефицита и профицита
                    </span>
                  </div>
                  <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    Обновлено: {new Date().toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] shadow-md"></div>
                  <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] flex items-center justify-center shadow-sm">
                    <TrendingDown className="h-16 w-16 text-white/90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative container mx-auto px-6 py-12 space-y-12">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Дефицит"
            value={mockForecastData.metrics.deficitSchools}
            subtitle="количество школ"
            icon={<TrendingDown className="h-6 w-6" />}
            variant="danger"
            trend="down"
            trendValue="-5%"
          />

          <StatCard
            title="Профицит"
            value={mockForecastData.metrics.surplusSchools}
            subtitle="количество школ"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            trend="up"
            trendValue="+8%"
          />

          <StatCard
            title="Сумма дефицита"
            value={mockForecastData.metrics.totalDeficit}
            subtitle="количество мест"
            icon={<Users className="h-6 w-6" />}
            variant="warning"
          />

          <StatCard
            title="Сумма профицита"
            value={mockForecastData.metrics.totalSurplus}
            subtitle="количество мест"
            icon={<Building2 className="h-6 w-6" />}
            variant="default"
          />
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3 flex items-center justify-center">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Фильтры
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Район
                </label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите район" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все районы</SelectItem>
                    {mockForecastData.districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Поиск школы
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Введите название школы"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/60 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Рейтинг школ
                </label>
                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите рейтинг" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все рейтинги</SelectItem>
                    <SelectItem value="high">Высокий (4.5+)</SelectItem>
                    <SelectItem value="medium">Средний (4.0-4.5)</SelectItem>
                    <SelectItem value="low">Низкий (&lt;4.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Категория школ
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="public">Государственные</SelectItem>
                    <SelectItem value="private">Частные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Год
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Map Toggle and Placeholder */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-3 flex items-center justify-center">
                  <Map className="h-4 w-4 text-white" />
                </div>
                Карта прогноза загруженности
              </h2>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <Button
                  size="sm"
                  variant={viewMode === "polygons" ? "default" : "ghost"}
                  onClick={() => setViewMode("polygons")}
                  className={`text-sm ${
                    viewMode === "polygons" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  Полигоны
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "schools" ? "default" : "ghost"}
                  onClick={() => setViewMode("schools")}
                  className={`text-sm ${
                    viewMode === "schools" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  Школы
                </Button>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto flex items-center justify-center">
                  <Map className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-600">
                    Интерактивная карта
                  </p>
                  <p className="text-sm text-slate-500">
                    Режим:{" "}
                    {viewMode === "polygons"
                      ? "Полигоны районов"
                      : "Точки школ"}
                  </p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6 justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-slate-600 font-medium">
                  Дефицит мест
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-sm text-slate-600 font-medium">
                  Профицит мест
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-slate-400 rounded"></div>
                <span className="text-sm text-slate-600 font-medium">
                  Сбалансированная загрузка
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
                <List className="h-4 w-4 text-white" />
              </div>
              Таблица школ ({filteredSchools.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Название школы
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Район
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Категория
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Вместимость
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Дети 2024
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Дети 2025
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Дефицит
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Профицит
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Рейтинг
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-800">
                            {school.nameRu}
                          </p>
                          <Badge className={getZoneBadgeColor(school.zone)}>
                            {school.zone === "deficit"
                              ? "Дефицит"
                              : school.zone === "surplus"
                              ? "Профицит"
                              : "Сбалансировано"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {school.district}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs">
                          {school.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-800">
                        {school.capacity.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600">
                        {school.students2024.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-800">
                        {school.students2025.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {school.deficit < 0 ? (
                          <span className="font-bold text-red-600">
                            {Math.abs(school.deficit)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {school.surplus > 0 ? (
                          <span className="font-bold text-emerald-600">
                            {school.surplus}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {renderStars(school.rating)}
                          <span className="ml-2 text-sm font-medium text-slate-600">
                            {school.rating}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Demand Forecast Chart */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              График прогноза спроса
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="font-medium text-slate-700">
                      Спрос детей 6-17 лет
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {mockForecastData.demandForecast
                      .find((d) => d.year === 2025)
                      ?.demand.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    актуальное значение на 2025 год
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                    <span className="font-medium text-slate-700">
                      Статус школ (вместимость)
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    {mockForecastData.demandForecast
                      .find((d) => d.year === 2025)
                      ?.capacity.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    текущая вместимость школ
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockForecastData.demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString()}`,
                        name === "demand"
                          ? "Спрос детей 6-17"
                          : "Вместимость школ",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="demand"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                      name="demand"
                    />
                    <Line
                      type="monotone"
                      dataKey="capacity"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 5 }}
                      name="capacity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(SchoolForecastPage);
