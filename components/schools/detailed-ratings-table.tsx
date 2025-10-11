"use client";

import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Download,
  Eye,
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
} from "lucide-react";

import { School, District, AdvancedSchoolFilters } from "@/types/schools";
import { getRatingZoneColor } from "@/lib/rating-utils";

interface DetailedRatingsTableProps {
  schools: School[];
  districts: District[];
  onExport: (schools: School[], title: string) => void;
  onViewPassport: (schoolId: string) => void;
}

export default function DetailedRatingsTable({
  schools,
  districts,
  onExport,
  onViewPassport,
}: DetailedRatingsTableProps) {
  const [filters, setFilters] = useState<AdvancedSchoolFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(
    new Set()
  );
  const [sortConfig, setSortConfig] = useState<{
    column: keyof School;
    order: "asc" | "desc";
  }>({
    column: "currentRating",
    order: "desc",
  });

  // Применение фильтров и сортировки
  const filteredSchools = schools
    .filter((school) => {
      // Фильтр по району
      if (filters.districtId && school.districtId !== filters.districtId) {
        return false;
      }

      // Фильтр по поиску
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !school.nameRu.toLowerCase().includes(searchLower) &&
          !school.nameKz.toLowerCase().includes(searchLower) &&
          !school.address.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Фильтр по зоне рейтинга
      if (filters.ratingZone && school.ratingZone !== filters.ratingZone) {
        return false;
      }

      // Фильтр по диапазону рейтинга
      if (filters.ratingMin && school.currentRating < filters.ratingMin) {
        return false;
      }
      if (filters.ratingMax && school.currentRating > filters.ratingMax) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.order === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

  const handleSort = (column: keyof School) => {
    setSortConfig((prev) => ({
      column,
      order: prev.column === column && prev.order === "desc" ? "asc" : "desc",
    }));
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
      setSelectedSchools(new Set(filteredSchools.map((school) => school.id)));
    } else {
      setSelectedSchools(new Set());
    }
  };

  const handleExportSelected = () => {
    const selectedSchoolsData = filteredSchools.filter((school) =>
      selectedSchools.has(school.id)
    );
    onExport(
      selectedSchoolsData,
      `Выбранные школы (${selectedSchoolsData.length})`
    );
  };

  const handleExportAll = () => {
    onExport(
      filteredSchools,
      `Все школы с фильтрами (${filteredSchools.length})`
    );
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSelectedSchools(new Set());
  };

  const SortButton = ({
    column,
    children,
  }: {
    column: keyof School;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-auto p-1 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
        {sortConfig.column === column && (
          <span className="text-blue-600 dark:text-blue-400 text-xs">
            {sortConfig.order === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </Button>
  );

  return (
    <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Таблица рейтингов всех показателей ({filteredSchools.length})
            </span>
          </div>
          <div className="flex gap-3">
            {selectedSchools.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                className="flex items-center gap-2 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 dark:border-emerald-600 dark:hover:bg-emerald-950/30 transition-all duration-200 font-semibold"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Экспорт выбранных ({selectedSchools.size})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              className="flex items-center gap-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-600 dark:hover:bg-blue-950/30 transition-all duration-200 font-semibold"
            >
              <Download className="h-4 w-4" />
              Экспорт всех
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Фильтры */}
        <div className="bg-slate-50/60 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Фильтрация по школе
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Поиск по школе */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Поиск по школе
              </label>
              <Input
                placeholder="Название школы..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-slate-300 dark:border-slate-600"
              />
            </div>

            {/* Район */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Район
              </label>
              <Select
                value={filters.districtId || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    districtId: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger className="border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Все районы" />
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

            {/* Зона рейтинга */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Зона рейтинга
              </label>
              <Select
                value={filters.ratingZone || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    ratingZone:
                      value === "all"
                        ? undefined
                        : (value as "green" | "yellow" | "red"),
                  }))
                }
              >
                <SelectTrigger className="border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Все зоны" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все зоны</SelectItem>
                  <SelectItem value="green">Зеленая (86%-100%)</SelectItem>
                  <SelectItem value="yellow">Желтая (50%-85%)</SelectItem>
                  <SelectItem value="red">Красная (5%-49%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Кнопка сброса */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <TableRow className="border-slate-200 dark:border-slate-600">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedSchools.size === filteredSchools.length &&
                      filteredSchools.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <SortButton column="nameRu">Наименование школы</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="currentRating">Общий рейтинг</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="q1Rating">За 1-четверть</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="q2Rating">За 2-четверть</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="q3Rating">За 3-четверть</SortButton>
                </TableHead>
                <TableHead>Качество знаний</TableHead>
                <TableHead>Динамика результатов</TableHead>
                <TableHead>Квалификация педагогов</TableHead>
                <TableHead>Оснащенность</TableHead>
                <TableHead>Развитие талантов</TableHead>
                <TableHead>Профилактика нарушений</TableHead>
                <TableHead>Инклюзивное образование</TableHead>
                <TableHead>Просмотр паспорта</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow
                  key={school.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedSchools.has(school.id)}
                      onCheckedChange={(checked) =>
                        handleSchoolSelect(school.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {school.nameRu}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {school.district.nameRu}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: getRatingZoneColor(school.ratingZone),
                      }}
                      className="text-white font-bold"
                    >
                      {school.currentRating}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg font-bold text-blue-700 dark:text-blue-300">
                      {school.q1Rating}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {school.q2Rating}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-lg font-bold text-purple-700 dark:text-purple-300">
                      {school.q3Rating}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {school.indicators.K}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      {school.indicators.C}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {school.indicators.P}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {school.indicators.A}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {school.indicators.T}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">
                      {school.indicators.V}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-pink-600 dark:text-pink-400 font-bold">
                      {school.indicators.I}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPassport(school.id)}
                      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-blue-300 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                      ПАСПОРТ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Школы не найдены. Попробуйте изменить параметры фильтрации.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
