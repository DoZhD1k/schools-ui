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
  TrendingUp,
  TrendingDown,
  Star,
  List,
  Eye,
  MapPin,
  AlertTriangle,
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
import { useRouter } from "next/navigation";
import Link from "next/link";

// JWT декодинг
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Компонент статистической карточки
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "danger" | "warning" | "success" | "info";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "from-red-500/20 to-rose-600/20 border-red-200/50 text-red-900";
      case "warning":
        return "from-amber-500/20 to-orange-600/20 border-amber-200/50 text-amber-900";
      case "success":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-200/50 text-emerald-900";
      case "info":
        return "from-blue-500/20 to-indigo-600/20 border-blue-200/50 text-blue-900";
      default:
        return "from-slate-500/20 to-gray-600/20 border-slate-200/50 text-slate-900";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getVariantStyles()} backdrop-blur-md rounded-3xl`}
      ></div>
      <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
      <div className="relative p-6 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <div className="text-2xl font-bold text-slate-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Мок данные
const mockDeficitData = {
  summary: {
    deficitSchools: 0,
    surplusSchools: 0,
    totalDeficit: 0,
    totalSurplus: 0,
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
  categories: ["Государственные", "Частные", "Международные"],
  years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
  schools: [
    {
      id: 1,
      nameRu: "Школа-лицей №165 имени Гани Муратбаева",
      district: "Алмалинский район",
      category: "Государственная",
      capacity: 1400,
      currentStudents: 1400,
      deficit: 0,
      surplus: 0,
      rating: 4.5,
      zone: "balanced",
      coordinates: [76.9286, 43.2371],
    },
    {
      id: 2,
      nameRu: "СОШ №95",
      district: "Ауэзовский район",
      category: "Государственная",
      capacity: 800,
      currentStudents: 800,
      deficit: 0,
      surplus: 0,
      rating: 4.2,
      zone: "balanced",
      coordinates: [76.8956, 43.2156],
    },
    {
      id: 3,
      nameRu: "Гимназия №148",
      district: "Бостандыкский район",
      category: "Государственная",
      capacity: 1200,
      currentStudents: 1200,
      deficit: 0,
      surplus: 0,
      rating: 4.8,
      zone: "balanced",
      coordinates: [76.9456, 43.2556],
    },
  ],
};

function DeficitPage() {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Пользователь");
  const router = useRouter();

  // Состояния фильтров
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");

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

  // Фильтрация данных
  const filteredSchools = mockDeficitData.schools.filter((school) => {
    const matchesDistrict =
      selectedDistrict === "all" || school.district === selectedDistrict;
    const matchesCategory =
      selectedCategory === "all" || school.category === selectedCategory;
    const matchesSearch = school.nameRu
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRating =
      selectedRating === "all" || school.rating >= parseFloat(selectedRating);

    return matchesDistrict && matchesCategory && matchesSearch && matchesRating;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      {/* <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <AlertTriangle className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Прогноз дефицита школьных мест
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Критический анализ нехватки мест в образовательных учреждениях
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
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
      </header> */}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-orange-600/90 to-amber-700/90"></div>
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
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Прогноз дефицита школьных мест
              </h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Анализ и прогнозирование нехватки мест в образовательных
                учреждениях по районам города с детальной статистикой и
                визуализацией.
              </p>
              <div className="flex items-center space-x-6 text-white/90">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(239,68,68,0.6)]"></div>
                  <span className="text-sm font-medium">
                    Критический анализ
                  </span>
                </div>
                <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                  Прогноз на: {selectedYear} год
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
            title="Дефицит (кол-во школ)"
            value={mockDeficitData.summary.deficitSchools}
            subtitle="образовательных учреждений"
            icon={<TrendingDown className="h-6 w-6" />}
            variant="danger"
          />

          <StatCard
            title="Профицит (кол-во школ)"
            value={mockDeficitData.summary.surplusSchools}
            subtitle="образовательных учреждений"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />

          <StatCard
            title="Сумма дефицита (мест)"
            value={mockDeficitData.summary.totalDeficit}
            subtitle="недостающих мест"
            icon={<Users className="h-6 w-6" />}
            variant="warning"
          />

          <StatCard
            title="Сумма профицита (мест)"
            value={mockDeficitData.summary.totalSurplus}
            subtitle="свободных мест"
            icon={<Building2 className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Filters Section */}
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
              {/* Район */}
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
                    {mockDeficitData.districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Поиск школы */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Поиск школы (Наименование школы)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Введите название школы..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/60 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Рейтинг школ */}
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
                    <SelectItem value="4.5">4.5 и выше</SelectItem>
                    <SelectItem value="4.0">4.0 и выше</SelectItem>
                    <SelectItem value="3.5">3.5 и выше</SelectItem>
                    <SelectItem value="3.0">3.0 и выше</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Категории */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Категории
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {mockDeficitData.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Год */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Год
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDeficitData.years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Карта прогноза загруженности */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mr-3 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              Карта прогноза загруженности (2024)
            </h2>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="polygons"
                  name="mapView"
                  className="text-blue-600"
                  defaultChecked
                />
                <label htmlFor="polygons" className="text-sm text-slate-700">
                  Полигоны
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="schools"
                  name="mapView"
                  className="text-blue-600"
                />
                <label htmlFor="schools" className="text-sm text-slate-700">
                  Школы
                </label>
              </div>
            </div>

            <div className="bg-slate-100 rounded-lg h-96 mb-4 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Интерактивная карта загруженности школ
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Здесь будет отображена карта с цветовой индикацией по районам
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-700">Критический дефицит</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-slate-700">Высокий дефицит</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-slate-700">Средний дефицит</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-700">Норма</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-slate-700">Профицит</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schools List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
                <List className="h-4 w-4 text-white" />
              </div>
              Список школ ({filteredSchools.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Школа
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Район
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Категория
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Вместимость
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Учащихся
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Баланс
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Рейтинг
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school) => (
                    <tr
                      key={school.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {school.nameRu}
                          </div>
                          <div className="text-sm text-slate-500">
                            ID: {school.id}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-slate-700">
                        {school.district}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary">{school.category}</Badge>
                      </td>
                      <td className="text-center py-3 px-4 text-slate-700">
                        {school.capacity.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4 text-slate-700">
                        {school.currentStudents.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4">
                        {school.deficit > 0 ? (
                          <Badge variant="destructive">-{school.deficit}</Badge>
                        ) : school.surplus > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            +{school.surplus}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Баланс</Badge>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-700">
                            {school.rating}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Link
                          href={`/schools/passport/${school.id}`}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Просмотр</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  Нет школ, соответствующих критериям
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Попробуйте изменить фильтры поиска
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(DeficitPage);
