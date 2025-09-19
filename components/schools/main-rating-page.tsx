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
    <div className="container mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Цифровой рейтинг школ
        </h1>
        <p className="text-xl text-gray-600">
          Общий рейтинг образовательных организаций
        </p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по названию школы..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={filters.districtId || "all"}
                onValueChange={handleDistrictFilter}
              >
                <SelectTrigger>
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
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Общие показатели */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Всего школ
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallStats.totalSchools}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              const greenSchools = schools.filter(
                (s) => s.ratingZone === "green"
              );
              openZoneModal("Зеленая зона", greenSchools);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {overallStats.greenPercentage}%
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Зеленая зона
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.greenZone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              const yellowSchools = schools.filter(
                (s) => s.ratingZone === "yellow"
              );
              openZoneModal("Желтая зона", yellowSchools);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {overallStats.yellowPercentage}%
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Желтая зона
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {overallStats.yellowZone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              const redSchools = schools.filter((s) => s.ratingZone === "red");
              openZoneModal("Красная зона", redSchools);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {overallStats.redPercentage}%
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Красная зона
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStats.redZone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Средний рейтинг
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overallStats.averageRating}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График школ по районам */}
        <Card>
          <CardHeader>
            <CardTitle>Общее количество школ по районам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
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
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* График школ по рейтингу */}
        <Card>
          <CardHeader>
            <CardTitle>Количество школ по рейтингу в разрезе районов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="green"
                  stackId="a"
                  fill="#22c55e"
                  name="Зеленая зона"
                />
                <Bar
                  dataKey="yellow"
                  stackId="a"
                  fill="#eab308"
                  name="Желтая зона"
                />
                <Bar
                  dataKey="red"
                  stackId="a"
                  fill="#ef4444"
                  name="Красная зона"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Таблица рейтинга школ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Рейтинг школ</span>
            <div className="flex gap-2">
              {selectedSchools.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Экспорт выбранных ({selectedSchools.size})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(false)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт всех
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
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
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("nameRu")}
                  >
                    Наименование
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("district")}
                  >
                    Район
                  </th>
                  <th className="text-left p-4">Адрес</th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("currentRating")}
                  >
                    Текущий рейтинг
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("q1Rating")}
                  >
                    1-я четв.
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("q2Rating")}
                  >
                    2-я четв.
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("q3Rating")}
                  >
                    3-я четв.
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("yearlyRating")}
                  >
                    Годовой
                  </th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedSchools.has(school.id)}
                        onCheckedChange={(checked) =>
                          handleSchoolSelect(school.id, !!checked)
                        }
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{school.nameRu}</p>
                        <p className="text-sm text-gray-500">
                          {school.organizationType}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">{school.district.nameRu}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {school.address}
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
                          className="text-white"
                        >
                          {school.currentRating}
                        </Badge>
                        {formatTrend(school.currentRating, school.q3Rating)}
                      </div>
                    </td>
                    <td className="p-4">{school.q1Rating}</td>
                    <td className="p-4">{school.q2Rating}</td>
                    <td className="p-4">{school.q3Rating}</td>
                    <td className="p-4">{school.yearlyRating}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          // Переход на паспорт школы
                          window.location.href = `/ru/schools/passport/${school.id}`;
                        }}
                      >
                        <Eye className="h-3 w-3" />
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Найдено школ: {modalData.length}</p>
              <Button
                onClick={() => handleExport(false)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Наименование</th>
                    <th className="text-left p-2">Адрес</th>
                    <th className="text-left p-2">Телефон</th>
                    <th className="text-left p-2">Директор</th>
                    <th className="text-left p-2">Рейтинг</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((school) => (
                    <tr key={school.id} className="border-b">
                      <td className="p-2">
                        <p className="font-medium">{school.nameRu}</p>
                        <p className="text-sm text-gray-500">
                          {school.organizationType}
                        </p>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {school.address}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {school.phone || "-"}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-gray-400" />
                          {school.director}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          style={{
                            backgroundColor: getRatingZoneColor(
                              school.ratingZone
                            ),
                          }}
                          className="text-white"
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Найдено школ: {modalData.length}</p>
              <Button
                onClick={() => handleExport(false)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Экспорт
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Наименование</th>
                    <th className="text-left p-2">Район</th>
                    <th className="text-left p-2">Адрес</th>
                    <th className="text-left p-2">Рейтинг</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((school) => (
                    <tr key={school.id} className="border-b">
                      <td className="p-2">
                        <p className="font-medium">{school.nameRu}</p>
                        <p className="text-sm text-gray-500">
                          {school.organizationType}
                        </p>
                      </td>
                      <td className="p-2">{school.district.nameRu}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {school.address}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          style={{
                            backgroundColor: getRatingZoneColor(
                              school.ratingZone
                            ),
                          }}
                          className="text-white"
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
  );
}
