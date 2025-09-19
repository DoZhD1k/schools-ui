"use client";

import { useEffect, useState, useRef } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Phone,
  User,
  Calendar,
  Users,
  Building2,
  Eye,
  Map,
} from "lucide-react";

import { School, District, SchoolFilters } from "@/types/schools";
import { SchoolsService } from "@/services/schools.service";
import { getRatingZoneColor } from "@/lib/rating-utils";
import "./school-map.css";

// Мок компонента карты (в реальном проекте это была бы Mapbox или другая карта)
interface MapComponentProps {
  schools: School[];
  onSchoolClick: (school: School) => void;
  selectedSchoolId?: string;
}

function MapComponent({
  schools,
  onSchoolClick,
  selectedSchoolId,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"
    >
      {/* Заглушка карты */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Интерактивная карта</p>
          <p className="text-sm text-gray-500">
            Здесь будет отображаться карта с пинами школ
          </p>
        </div>
      </div>

      {/* Пины школ */}
      <div className="absolute inset-0">
        {schools.map((school, index) => {
          if (!school.coordinates) return null;

          // Простое позиционирование для демонстрации
          const left = 20 + (index % 5) * 15;
          const top = 20 + Math.floor(index / 5) * 15;

          return (
            <button
              key={school.id}
              className={`school-pin ${school.ratingZone} ${
                selectedSchoolId === school.id ? "selected" : ""
              }`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              onClick={() => onSchoolClick(school)}
              title={school.nameRu}
            />
          );
        })}
      </div>

      {/* Легенда */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-medium text-sm mb-2">Легенда</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Зеленая зона (86-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Желтая зона (50-85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Красная зона (5-49%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SchoolSidePanelProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
}

function SchoolSidePanel({ school, isOpen, onClose }: SchoolSidePanelProps) {
  if (!school) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Информация о школе</SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Выберите школу на карте</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-left">{school.nameRu}</SheetTitle>
              <p className="text-sm text-gray-600 mt-1">{school.nameKz}</p>
            </div>
            <Badge
              style={{ backgroundColor: getRatingZoneColor(school.ratingZone) }}
              className="text-white ml-2"
            >
              {school.currentRating}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Основная информация</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Район</p>
                  <p className="text-sm text-gray-600">
                    {school.district.nameRu}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Адрес</p>
                  <p className="text-sm text-gray-600">{school.address}</p>
                </div>
              </div>

              {school.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Телефон</p>
                    <p className="text-sm text-gray-600">{school.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Директор</p>
                  <p className="text-sm text-gray-600">{school.director}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Год основания
                  </p>
                  <p className="text-sm text-gray-600">{school.foundedYear}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Проектная мощность
                  </p>
                  <p className="text-sm text-gray-600">
                    {school.capacity.toLocaleString()} учащихся
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Количество учащихся
                  </p>
                  <p className="text-sm text-gray-600">
                    {school.currentStudents.toLocaleString()} учащихся
                  </p>
                  <div className="mt-1 progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(
                          (school.currentStudents / school.capacity) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (school.currentStudents / school.capacity) * 100
                    )}
                    % заполненности
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Рейтинг и зона */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Рейтинг</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Общий рейтинг</span>
                <Badge
                  style={{
                    backgroundColor: getRatingZoneColor(school.ratingZone),
                  }}
                  className="text-white"
                >
                  {school.currentRating}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {school.ratingZone === "green"
                  ? "Зеленая зона (86-100%)"
                  : school.ratingZone === "yellow"
                  ? "Желтая зона (50-85%)"
                  : "Красная зона (5-49%)"}
              </p>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>1-я четверть: {school.q1Rating}</span>
                  <span>2-я четверть: {school.q2Rating}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>3-я четверть: {school.q3Rating}</span>
                  <span>Годовой: {school.yearlyRating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Тип организации */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Тип организации</h3>
            <p className="text-sm text-gray-600">{school.organizationType}</p>
          </div>

          {/* Кнопка перехода к паспорту */}
          <div className="pt-4 border-t">
            <Button
              className="w-full"
              onClick={() => {
                window.location.href = `/ru/schools/passport/${school.id}`;
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Открыть полный паспорт
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function SchoolMapPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фильтры
  const [filters, setFilters] = useState<SchoolFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Состояние карты
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

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

      const districtsData = await SchoolsService.getDistricts();
      setDistricts(districtsData);

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

      const schoolsData = await SchoolsService.getSchoolsForMap(currentFilters);
      setSchools(schoolsData);
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

  const handleSchoolClick = (school: School) => {
    setSelectedSchool(school);
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
    setSelectedSchool(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка карты...</p>
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
    <div className="h-screen flex flex-col">
      {/* Заголовок */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Интерактивная карта школ
            </h1>
            <p className="text-gray-600">
              Карта образовательных организаций города
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Показано школ: {schools.length}
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск школы..."
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
      </div>

      {/* Карта */}
      <div className="flex-1 relative">
        <MapComponent
          schools={schools}
          onSchoolClick={handleSchoolClick}
          selectedSchoolId={selectedSchool?.id}
        />

        {/* Боковая панель */}
        <SchoolSidePanel
          school={selectedSchool}
          isOpen={sidePanelOpen}
          onClose={handleCloseSidePanel}
        />
      </div>
    </div>
  );
}
