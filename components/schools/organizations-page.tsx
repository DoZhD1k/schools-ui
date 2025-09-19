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
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";

import { School, District, SchoolFilters } from "@/types/schools";
import { SchoolsService } from "@/services/schools.service";
import { getRatingZoneColor, sortSchools } from "@/lib/rating-utils";

const ITEMS_PER_PAGE = 20;

export default function OrganizationsPage() {
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры и поиск
  const [filters, setFilters] = useState<SchoolFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("currentRating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const districtsData = await SchoolsService.getDistricts();
      setDistricts(districtsData);
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

      let schoolsData = await SchoolsService.getSchools(currentFilters);
      schoolsData = sortSchools(schoolsData, sortBy as keyof School, sortOrder);

      setFilteredSchools(schoolsData);
      setCurrentPage(1);
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

  const handleExport = async () => {
    try {
      const exportData = await SchoolsService.exportSchools({
        ...filters,
        search: searchTerm,
      });

      console.log("Экспорт данных:", exportData);
      alert("Экспорт выполнен успешно!");
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при экспорте данных");
    }
  };

  // Пагинация
  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSchools = filteredSchools.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Организации образования
        </h1>
        <p className="text-xl text-gray-600">
          Каталог образовательных организаций
        </p>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры и поиск
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Экспорт в Excel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по названию, адресу, директору..."
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

      {/* Результаты */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Найдено организаций: {filteredSchools.length}
            </div>
            <div className="text-sm text-gray-600">
              Показано {startIndex + 1}-
              {Math.min(endIndex, filteredSchools.length)} из{" "}
              {filteredSchools.length}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Таблица школ */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("nameRu")}
                  >
                    <div className="flex items-center gap-2">
                      Название
                      {sortBy === "nameRu" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("district")}
                  >
                    <div className="flex items-center gap-2">
                      Район
                      {sortBy === "district" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4">Адрес</th>
                  <th className="text-left p-4">Контакты</th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("currentRating")}
                  >
                    <div className="flex items-center gap-2">
                      Рейтинг
                      {sortBy === "currentRating" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-left p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("currentStudents")}
                  >
                    <div className="flex items-center gap-2">
                      Учащиеся
                      {sortBy === "currentStudents" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4">Тип организации</th>
                  <th className="text-left p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentSchools.map((school) => (
                  <tr key={school.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {school.nameRu}
                        </p>
                        <p className="text-sm text-gray-500">{school.nameKz}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900">
                        {school.district.nameRu}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-xs">
                          {school.address}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {school.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            {school.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-xs">
                            {school.director}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        style={{
                          backgroundColor: getRatingZoneColor(
                            school.ratingZone
                          ),
                        }}
                        className="text-white font-medium"
                      >
                        {school.currentRating}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        {school.currentStudents.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        из {school.capacity.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {school.organizationType}
                      </p>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
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

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Показано {startIndex + 1}-
                {Math.min(endIndex, filteredSchools.length)} из{" "}
                {filteredSchools.length}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Далее
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
