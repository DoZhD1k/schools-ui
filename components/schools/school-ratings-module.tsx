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
import { Search, Filter, GraduationCap, TrendingUp } from "lucide-react";

import {
  School,
  District,
  DistrictStats,
  SchoolFilters,
} from "@/types/schools";
import { SchoolsService } from "@/services/integrated-schools.service";

// Импорт созданных компонентов
import DistrictSchoolsChart from "./district-schools-chart";
import RatingZonesChart from "./rating-zones-chart";
import RatingIndicators from "./rating-indicators";
import DetailedRatingsTable from "./detailed-ratings-table";

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

export default function SchoolRatingsModule() {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Глобальные фильтры для всего модуля
  const [globalFilters, setGlobalFilters] = useState<SchoolFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyGlobalFilters();
  }, [globalFilters, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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

      await applyGlobalFilters();
    } catch (err) {
      setError("Ошибка при загрузке данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyGlobalFilters = async () => {
    try {
      const currentFilters = {
        ...globalFilters,
        search: searchTerm || undefined,
      };

      const schoolsData = await SchoolsService.getSchools(currentFilters);
      setSchools(schoolsData);
    } catch (err) {
      console.error("Ошибка при применении фильтров:", err);
    }
  };

  const handleDistrictFilter = (districtId: string) => {
    setGlobalFilters((prev) => ({
      ...prev,
      districtId: districtId === "all" ? undefined : districtId,
    }));
  };

  const handleExport = async (exportSchools: School[], title: string) => {
    try {
      const exportData = await SchoolsService.exportSchools({
        ...globalFilters,
        search: searchTerm,
      });

      // Здесь можно интегрировать библиотеку для экспорта в Excel
      console.log("Экспорт данных:", {
        title,
        count: exportSchools.length,
        data: exportData,
      });

      // Имитация скачивания файла
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      alert(`Экспорт "${title}" выполнен успешно!`);
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при экспорте данных");
    }
  };

  const handleViewPassport = (schoolId: string) => {
    // Переход на страницу паспорта школы
    window.location.href = `/ru/schools/passport/${schoolId}`;
  };

  const resetFilters = () => {
    setGlobalFilters({});
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            Загрузка данных...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-10">
        {/* Заголовок модуля */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-4">
            Общий рейтинг школ
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
            Модуль для анализа рейтинга образовательных организаций города
            Алматы
          </p>
        </div>

        {/* Глобальные фильтры */}
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
            <div className="flex flex-col lg:flex-row gap-6">
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
              <div className="w-full lg:w-80">
                <Select
                  value={globalFilters.districtId || "all"}
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
                onClick={resetFilters}
                className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:hover:bg-slate-800 transition-all duration-200 font-semibold px-6 py-3 rounded-xl"
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Общие показатели */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white/80 to-slate-50/60 dark:from-slate-800/80 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Всего школ
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {schools.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-emerald-200/60 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "green")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Зеленая зона
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {schools.filter((s) => s.ratingZone === "green").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-amber-200/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/40 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "yellow")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Желтая зона
                    </p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {schools.filter((s) => s.ratingZone === "yellow").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-red-200/60 dark:border-red-700/60 bg-gradient-to-br from-red-50/80 to-white dark:from-red-950/40 dark:to-slate-900/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "red")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Красная зона
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {schools.filter((s) => s.ratingZone === "red").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Графики распределения школ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DistrictSchoolsChart
            districtStats={districtStats}
            schools={schools}
            onExport={handleExport}
          />
          <RatingZonesChart
            districtStats={districtStats}
            schools={schools}
            onExport={handleExport}
          />
        </div>

        {/* Круговые индикаторы рейтинга */}
        <RatingIndicators schools={schools} onExport={handleExport} />

        {/* Главная таблица рейтингов */}
        <DetailedRatingsTable
          schools={schools}
          districts={districts}
          onExport={handleExport}
          onViewPassport={handleViewPassport}
        />

        {/* Футер с информацией */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 dark:from-blue-950/40 dark:to-emerald-950/40 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Модуль «Общий рейтинг школ»
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Данный модуль разработан в соответствии с требованиями к системе
              цифрового рейтинга школ. Включает все необходимые компоненты:
              графики распределения по районам и зонам рейтинга, круговые
              индикаторы, детализированную таблицу со всеми показателями и
              функции экспорта данных.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
