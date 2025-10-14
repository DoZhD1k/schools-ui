"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

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
            placeholder="Введите название школы"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {localSearchQuery && (
            <button
              onClick={() => {
                setLocalSearchQuery("");
                onSchoolSearch("");
                onSchoolSelect(undefined);
              }}
              title="Очистить поиск"
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Dropdown со школами */}
        {showSchoolDropdown &&
          localSearchQuery &&
          filteredSchools.length > 0 && (
            <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSchools.map((school) => (
                <button
                  key={school.schoolNumber}
                  onClick={() => handleSchoolSelect(school)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {school.schoolInfo?.name_of_the_organization}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span>№{school.schoolNumber}</span>
                      <span>•</span>
                      <span>{school.schoolInfo?.district}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Выбранная школа */}
      {selectedSchoolInfo && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="font-medium text-blue-900 text-sm truncate">
                {selectedSchoolInfo.schoolInfo?.name_of_the_organization}
              </div>
              <div className="text-xs text-blue-700">
                Школа №{selectedSchoolInfo.schoolNumber} •{" "}
                {selectedSchoolInfo.schoolInfo?.district}
              </div>
            </div>
            <button
              onClick={() => onSchoolSelect(undefined)}
              title="Убрать выбор школы"
              className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Фильтр по районам */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Фильтр по районам
        </label>
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
          {uniqueDistricts.map((district) => (
            <label
              key={district}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={selectedDistricts.includes(district)}
                onChange={(e) => {
                  const newSelected = e.target.checked
                    ? [...selectedDistricts, district]
                    : selectedDistricts.filter((d) => d !== district);
                  onDistrictChange(newSelected);
                }}
              />
              <span className="text-sm text-gray-700 leading-tight">
                {district}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Кнопка сброса */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Сбросить фильтры</span>
        </button>
      )}

      {/* Статистика */}
      <div className="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1">
        <div className="flex justify-between">
          <span>Школ найдено:</span>
          <span className="font-medium text-gray-700">
            {filteredSchoolsCount !== undefined
              ? filteredSchoolsCount
              : uniqueSchools.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Районов показано:</span>
          <span className="font-medium text-gray-700">
            {filteredPolygonsCount !== undefined ? filteredPolygonsCount : 0}
          </span>
        </div>
      </div>
    </div>
  );
}
