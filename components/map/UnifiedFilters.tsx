"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Filter, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

interface UniqueSchool {
  schoolNumber: string;
  schoolInfo?: {
    name_of_the_organization: string;
    district: string;
    types_of_educational_institutions: string;
  };
  languages: Array<"bilingual" | "kazakh" | "russian" | "uyghur">;
}

interface UnifiedFiltersProps {
  selectedSchool?: string;
  schoolSearchQuery?: string;
  uniqueSchools: UniqueSchool[];
  uniqueDistricts: string[];
  selectedDistricts: string[];
  filteredSchoolsCount?: number;
  filteredPolygonsCount?: number;
  onSchoolSelect: (schoolNumber: string | undefined) => void;
  onSchoolSearch: (query: string) => void;
  onDistrictChange: (districts: string[]) => void;
  onReset: () => void;
}

export default function UnifiedFilters({
  selectedSchool,
  schoolSearchQuery = "",
  uniqueSchools,
  uniqueDistricts,
  selectedDistricts,
  filteredSchoolsCount,
  filteredPolygonsCount,
  onSchoolSelect,
  onSchoolSearch,
  onDistrictChange,
  onReset,
}: UnifiedFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(schoolSearchQuery);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  // Фильтруем школы по поисковому запросу
  const filteredSchools = uniqueSchools
    .filter((school) =>
      school.schoolInfo?.name_of_the_organization
        .toLowerCase()
        .includes(localSearchQuery.toLowerCase())
    )
    .slice(0, 10); // Показываем только первые 10 результатов

  // Обновляем локальный поиск при изменении внешнего состояния
  useEffect(() => {
    setLocalSearchQuery(schoolSearchQuery);
  }, [schoolSearchQuery]);

  // Обработчик поиска с дебаунсом
  useEffect(() => {
    const timer = setTimeout(() => {
      onSchoolSearch(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSchoolSearch]);

  const handleSchoolSelect = (school: UniqueSchool) => {
    onSchoolSelect(school.schoolNumber);
    setLocalSearchQuery(school.schoolInfo?.name_of_the_organization || "");
    setShowSchoolDropdown(false);
  };

  const handleReset = () => {
    setLocalSearchQuery("");
    onReset();
  };

  const selectedSchoolInfo = uniqueSchools.find(
    (s) => s.schoolNumber === selectedSchool
  );
  const hasActiveFilters =
    selectedSchool || schoolSearchQuery || selectedDistricts.length > 0;

  return (
    <Card className="w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Фильтры
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle Polygons Visibility */}
        {/* <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-polygons" className="text-sm font-medium">
              Показать районы
            </Label>
            <Switch
              id="show-polygons"
              checked={showPolygons}
              onCheckedChange={setShowPolygons}
            />
          </div>

          {showPolygons && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Районы отображаются
            </div>
          )}

          {!showPolygons && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              Районы скрыты
            </div>
          )}
        </div> */}

        {/* <Separator /> */}

        {/* Заголовок фильтров */}
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Фильтр по школам
            </h3>
          </div> */}

          {hasActiveFilters && (
            <Button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Сбросить</span>
            </Button>
          )}
        </div>

        {/* Компактный вид выбранных фильтров */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-600 space-y-1">
            {selectedSchoolInfo && (
              <div className="flex items-center space-x-2">
                <School className="h-4 w-4" />
                <span className="truncate">
                  {selectedSchoolInfo.schoolInfo?.name_of_the_organization}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Развернутые фильтры */}
        <div className="space-y-4">
          {/* Поиск школы */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Поиск школы
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => {
                  setLocalSearchQuery(e.target.value);
                  setShowSchoolDropdown(true);
                }}
                onFocus={() => setShowSchoolDropdown(true)}
                placeholder="Введите название школы..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {localSearchQuery && (
                <Button
                  onClick={() => {
                    setLocalSearchQuery("");
                    onSchoolSearch("");
                    onSchoolSelect(undefined);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </Button>
              )}
            </div>

            {/* Dropdown со школами */}
            {showSchoolDropdown &&
              localSearchQuery &&
              filteredSchools.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSchools.map((school) => (
                    <Button
                      key={school.schoolNumber}
                      onClick={() => handleSchoolSelect(school)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 truncate">
                          {school.schoolInfo?.name_of_the_organization}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>№{school.schoolNumber}</span>
                          <span>•</span>
                          <span>{school.schoolInfo?.district}</span>
                          <span>•</span>
                          <span>{school.languages.length} язык(ов)</span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
          </div>

          {/* Выбранная школа */}
          {selectedSchoolInfo && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium text-blue-900">
                    {selectedSchoolInfo.schoolInfo?.name_of_the_organization}
                  </div>
                  <div className="text-sm text-blue-700">
                    Школа №{selectedSchoolInfo.schoolNumber} •{" "}
                    {selectedSchoolInfo.schoolInfo?.district}
                  </div>
                </div>
                <Button
                  onClick={() => onSchoolSelect(undefined)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Фильтр по районам */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Фильтр по районам
            </label>
            <div className=" overflow-y-auto border border-gray-200 rounded-md">
              {uniqueDistricts.map((district) => (
                <label
                  key={district}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedDistricts.includes(district)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selectedDistricts, district]
                        : selectedDistricts.filter((d) => d !== district);
                      onDistrictChange(newSelected);
                    }}
                  />
                  <span className="text-sm text-gray-700">{district}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Статистика */}
          <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex justify-between">
              <span>Школ найдено:</span>
              <span className="font-medium">
                {filteredSchoolsCount !== undefined
                  ? filteredSchoolsCount
                  : uniqueSchools.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Районов показано:</span>
              <span className="font-medium">
                {filteredPolygonsCount !== undefined
                  ? filteredPolygonsCount
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
