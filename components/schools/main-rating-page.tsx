"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Building2,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import {
  School,
  District,
  DistrictStats,
  SchoolFilters,
} from "@/types/schools";
import { SchoolsService } from "@/services/schools.service";
import { getRatingZoneColor, sortSchools } from "@/lib/rating-utils";

interface OverallStats {
  totalSchools: number;
  greenZone: number;
  yellowZone: number;
  redZone: number;
  averageRating: number;
  greenPercentage: number;
  yellowPercentage: number;
  redPercentage: number;
}

export default function MainRatingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState<SchoolFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Состояние таблицы
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<string>("currentRating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Модальные окна
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [modalData, setModalData] = useState<School[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [districtsData, districtStatsData, overallStatsData] =
        await Promise.all([
          SchoolsService.getDistricts(),
          SchoolsService.getDistrictStats(),
          SchoolsService.getOverallStats(),
        ]);

      setDistricts(districtsData);
      setDistrictStats(districtStatsData);
      setOverallStats(overallStatsData);

      await applyFilters();
    } catch (err) {
      setError("Ошибка при загрузке данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const currentFilters = {
        ...filters,
        search: searchTerm || undefined,
      };

      const schoolsData = await SchoolsService.getSchools(currentFilters);
      setSchools(sortSchools(schoolsData, sortBy as keyof School, sortOrder));
    } catch (err) {
      console.error("Ошибка при применении фильтров:", err);
    }
  };

  const handleDistrictFilter = (districtId: string) => {
    setFilters((prev) => ({
      ...prev,
      districtId: districtId === "all" ? undefined : districtId,
    }));
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleSchoolSelect = (schoolId: string, checked: boolean) => {
    const newSelected = new Set(selectedSchools);
    if (checked) {
      newSelected.add(schoolId);
    } else {
      newSelected.delete(schoolId);
    }
    setSelectedSchools(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchools(new Set(schools.map((school) => school.id)));
    } else {
      setSelectedSchools(new Set());
    }
  };

  const openDistrictModal = (
    districtName: string,
    districtSchools: School[]
  ) => {
    setModalTitle(`Школы района: ${districtName}`);
    setModalData(districtSchools);
    setDistrictModalOpen(true);
  };

  const openZoneModal = (zoneName: string, zoneSchools: School[]) => {
    setModalTitle(`Школы зоны: ${zoneName}`);
    setModalData(zoneSchools);
    setZoneModalOpen(true);
  };

  const handleExport = async (selectedOnly: boolean = false) => {
    try {
      const exportData = await SchoolsService.exportSchools({
        ...filters,
        search: searchTerm,
      });

      // В реальном приложении здесь была бы логика экспорта в Excel
      console.log("Экспорт данных:", exportData);
      console.log("Выбранные школы:", selectedOnly ? selectedSchools : "все");
      alert("Экспорт выполнен успешно!");
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при экспорте данных");
    }
  };

  const formatTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5)
      return <Minus className="h-4 w-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Подготовка данных для графиков
  const districtChartData = districtStats.map((stat) => ({
    name: stat.district.nameRu,
    total: stat.totalSchools,
    green: stat.greenZone,
    yellow: stat.yellowZone,
    red: stat.redZone,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Попробовать снова</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-10">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-4">
            Цифровой рейтинг школ
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
            Общий рейтинг образовательных организаций Республики Казахстан
          </p>
        </div>

        {/* Фильтры */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Фильтры и поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Поиск по названию школы..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 text-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="w-full md:w-80">
                <Select
                  value={filters.districtId || "all"}
                  onValueChange={handleDistrictFilter}
                >
                  <SelectTrigger className="py-3 text-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl">
                    <SelectValue placeholder="Выберите район" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все районы</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                }}
                className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:hover:bg-slate-800 transition-all duration-200 font-semibold px-6 py-3 rounded-xl"
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Общие показатели */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white/80 to-slate-50/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Всего школ
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {overallStats.totalSchools}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-emerald-200/60 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                const greenSchools = schools.filter(
                  (s) => s.ratingZone === "green"
                );
                openZoneModal("Зеленая зона", greenSchools);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {overallStats.greenPercentage}%
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Зеленая зона
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {overallStats.greenZone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-amber-200/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/40 dark:to-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                const yellowSchools = schools.filter(
                  (s) => s.ratingZone === "yellow"
                );
                openZoneModal("Желтая зона", yellowSchools);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {overallStats.yellowPercentage}%
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Желтая зона
                    </p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {overallStats.yellowZone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-red-200/60 dark:border-red-700/60 bg-gradient-to-br from-red-50/80 to-white dark:from-red-950/40 dark:to-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                const redSchools = schools.filter(
                  (s) => s.ratingZone === "red"
                );
                openZoneModal("Красная зона", redSchools);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {overallStats.redPercentage}%
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Красная зона
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {overallStats.redZone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-purple-200/60 dark:border-purple-700/60 bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-950/40 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Средний рейтинг
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {overallStats.averageRating}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* График школ по районам */}
          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-lg">
                  <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Общее количество школ по районам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={districtChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      fontWeight="bold"
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="url(#blueGradient)"
                      onClick={(data) => {
                        const district = districtStats.find(
                          (d) => d.district.nameRu === data.name
                        );
                        if (district) {
                          const districtSchools = schools.filter(
                            (s) => s.districtId === district.district.id
                          );
                          openDistrictModal(
                            district.district.nameRu,
                            districtSchools
                          );
                        }
                      }}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <defs>
                      <linearGradient
                        id="blueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* График школ по рейтингу */}
          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                Количество школ по рейтингу в разрезе районов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={districtChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                      fontWeight="bold"
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="green"
                      stackId="a"
                      fill="#22c55e"
                      name="Зеленая зона"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <Bar
                      dataKey="yellow"
                      stackId="a"
                      fill="#eab308"
                      name="Желтая зона"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <Bar
                      dataKey="red"
                      stackId="a"
                      fill="#ef4444"
                      name="Красная зона"
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Таблица рейтинга школ */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Рейтинг школ ({schools.length})
                </span>
              </div>
              <div className="flex gap-3">
                {selectedSchools.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(true)}
                    className="flex items-center gap-2 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-600 dark:hover:bg-emerald-950/30 transition-all duration-200 font-semibold"
                  >
                    <Download className="h-5 w-5" />
                    Экспорт выбранных ({selectedSchools.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(false)}
                  className="flex items-center gap-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-600 dark:hover:bg-blue-950/30 transition-all duration-200 font-semibold"
                >
                  <Download className="h-5 w-5" />
                  Экспорт всех
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={
                          selectedSchools.size === schools.length &&
                          schools.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("nameRu")}
                    >
                      <div className="flex items-center gap-2">
                        Наименование
                        {sortBy === "nameRu" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("district")}
                    >
                      <div className="flex items-center gap-2">
                        Район
                        {sortBy === "district" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Адрес
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("currentRating")}
                    >
                      <div className="flex items-center gap-2">
                        Текущий рейтинг
                        {sortBy === "currentRating" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("q1Rating")}
                    >
                      <div className="flex items-center gap-2">
                        1-я четв.
                        {sortBy === "q1Rating" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("q2Rating")}
                    >
                      <div className="flex items-center gap-2">
                        2-я четв.
                        {sortBy === "q2Rating" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("q3Rating")}
                    >
                      <div className="flex items-center gap-2">
                        3-я четв.
                        {sortBy === "q3Rating" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-lg font-bold text-slate-700 dark:text-slate-300"
                      onClick={() => handleSort("yearlyRating")}
                    >
                      <div className="flex items-center gap-2">
                        Годовой рейтинг
                        {sortBy === "yearlyRating" && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedSchools.has(school.id)}
                          onCheckedChange={(checked) =>
                            handleSchoolSelect(school.id, !!checked)
                          }
                          className="border-2 border-slate-300 dark:border-slate-600"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {school.nameRu}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {school.organizationType}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {school.district.nameRu}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
                            <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{school.address}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: getRatingZoneColor(
                                school.ratingZone
                              ),
                            }}
                            className="text-white font-bold shadow-lg"
                          >
                            {school.currentRating}
                          </Badge>
                          {formatTrend(school.currentRating, school.q3Rating)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg font-bold text-blue-700 dark:text-blue-300">
                          {school.q1Rating}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-lg font-bold text-emerald-700 dark:text-emerald-300">
                          {school.q2Rating}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-lg font-bold text-purple-700 dark:text-purple-300">
                          {school.q3Rating}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 rounded-lg font-bold text-amber-700 dark:text-amber-300">
                          {school.yearlyRating}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-300 transition-all duration-200 font-medium"
                          onClick={() => {
                            // Переход на паспорт школы
                            window.location.href = `/ru/schools/passport/${school.id}`;
                          }}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                          Паспорт
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Модальное окно районов */}
        <Dialog open={districtModalOpen} onOpenChange={setDistrictModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {modalTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 p-4 rounded-lg border border-slate-200/60 dark:border-slate-600/60">
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Найдено школ:{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {modalData.length}
                  </span>
                </p>
                <Button
                  onClick={() => handleExport(false)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  Экспорт
                </Button>
              </div>
              <div className="overflow-x-auto bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <table className="w-full table-auto">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                    <tr className="border-b border-slate-200 dark:border-slate-600">
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Наименование
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Адрес
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Телефон
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Директор
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Рейтинг
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((school) => (
                      <tr
                        key={school.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {school.nameRu}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {school.organizationType}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
                              <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">
                              {school.address}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="p-1 rounded-full bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900">
                              <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-medium">
                              {school.phone || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="p-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                              <User className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="font-medium">
                              {school.director}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            style={{
                              backgroundColor: getRatingZoneColor(
                                school.ratingZone
                              ),
                            }}
                            className="text-white font-bold shadow-lg"
                          >
                            {school.currentRating}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Модальное окно зон */}
        <Dialog open={zoneModalOpen} onOpenChange={setZoneModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {modalTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 p-4 rounded-lg border border-slate-200/60 dark:border-slate-600/60">
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Найдено школ:{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {modalData.length}
                  </span>
                </p>
                <Button
                  onClick={() => handleExport(false)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  Экспорт
                </Button>
              </div>
              <div className="overflow-x-auto bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <table className="w-full table-auto">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                    <tr className="border-b border-slate-200 dark:border-slate-600">
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Наименование
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Район
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Адрес
                      </th>
                      <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                        Рейтинг
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((school) => (
                      <tr
                        key={school.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {school.nameRu}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {school.organizationType}
                          </p>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                          {school.district.nameRu}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
                              <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">
                              {school.address}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            style={{
                              backgroundColor: getRatingZoneColor(
                                school.ratingZone
                              ),
                            }}
                            className="text-white font-bold shadow-lg"
                          >
                            {school.currentRating}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
