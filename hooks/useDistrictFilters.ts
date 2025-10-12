"use client";

import { useState, useEffect, useCallback } from "react";
import { BalanceEnrichedService } from "@/services/balance-enriched.service";
import { DistrictPolygonsService } from "@/services/district-polygons.service";
import {
  MapState,
  MapFilters,
  SchoolLanguageMapping,
} from "@/types/schools-map";

const initialFilters: MapFilters = {
  searchQuery: "",
  educationType: [],
  isPrivate: null,
  district: [],
  overloadStatus: [],
  ratingRange: [0, 10],
  capacityRange: [0, 2000],
  selectedSchool: undefined,
  selectedLanguage: null,
  schoolSearchQuery: "",
};

const initialState: MapState = {
  schools: [],
  filteredSchools: [],
  balanceData: [],
  districtPolygons: [],
  schoolLanguageMappings: [],
  filteredPolygons: [],
  filters: initialFilters,
  loading: false,
  error: null,
  selectedSchool: null,
};

export function useDistrictFilters() {
  const [state, setState] = useState<MapState>(initialState);

  // Загрузка данных
  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("🔄 Loading balance-enriched and schools data...");

      // Загружаем данные параллельно
      const [balanceData, schoolsData, loadedDistrictPolygons] =
        await Promise.all([
          BalanceEnrichedService.getBalanceEnrichedData(),
          BalanceEnrichedService.getSchoolsData(),
          DistrictPolygonsService.fetchDistrictPolygons(),
        ]);

      console.log("📊 Loaded data:", {
        balanceData: balanceData,
        balanceDataType: typeof balanceData,
        balanceDataIsArray: Array.isArray(balanceData),
        balanceItems: Array.isArray(balanceData)
          ? balanceData.length
          : "not array",
        schools: Array.isArray(schoolsData) ? schoolsData.length : "not array",
        districtPolygons: loadedDistrictPolygons.length,
      });

      // Создаем упрощенные маппинги (временно для отладки)
      const mappings: SchoolLanguageMapping[] = [];

      console.log("🗺️ Created school mappings:", mappings.length);

      // Используем полигоны, загруженные через DistrictPolygonsService
      console.log(
        "✅ Using district polygons from service:",
        loadedDistrictPolygons.length
      );

      // Конвертируем школы в SchoolFeature формат
      // Для полигонов используем origin_geom, для точек - origin_marker
      const schoolFeatures = schoolsData
        .filter(
          (school) => school.infra?.origin_geom || school.infra?.origin_marker
        )
        .map((school) => ({
          id: school.id,
          type: "Feature" as const,
          // Приоритет полигонам для отображения зданий школ
          geometry: school.infra!.origin_geom || school.infra!.origin_marker,
          properties: school,
        }));

      console.log("🏫 School features created:", {
        total: schoolsData.length,
        withInfra: schoolsData.filter((s) => s.infra).length,
        withGeom: schoolsData.filter((s) => s.infra?.origin_geom).length,
        withMarker: schoolsData.filter((s) => s.infra?.origin_marker).length,
        features: schoolFeatures.length,
      });

      setState((prev) => ({
        ...prev,
        balanceData,
        schools: schoolFeatures,
        filteredSchools: schoolFeatures,
        districtPolygons: loadedDistrictPolygons,
        schoolLanguageMappings: mappings,
        filteredPolygons: loadedDistrictPolygons,
        loading: false,
      }));
    } catch (error) {
      console.error("❌ Error loading data:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, []);

  // Применение фильтров
  const applyFilters = useCallback((newFilters: Partial<MapFilters>) => {
    setState((prev) => {
      const updatedFilters = { ...prev.filters, ...newFilters };

      console.log("🔍 Applying filters:", updatedFilters);

      // Изначально показываем все полигоны и школы
      const filteredPolygons = prev.districtPolygons;
      let filteredSchools = prev.schools;

      // Фильтрация школ по поисковому запросу
      if (
        updatedFilters.schoolSearchQuery &&
        updatedFilters.schoolSearchQuery.trim()
      ) {
        const query = updatedFilters.schoolSearchQuery.toLowerCase();
        filteredSchools = prev.schools.filter((school) =>
          school.properties.name_of_the_organization
            .toLowerCase()
            .includes(query)
        );
        console.log("🔍 Search filtered schools:", filteredSchools.length);
      }

      // Фильтрация школ по району
      if (updatedFilters.district && updatedFilters.district.length > 0) {
        filteredSchools = filteredSchools.filter((school) =>
          updatedFilters.district!.includes(school.properties.district)
        );
        console.log("🏘️ District filtered schools:", filteredSchools.length);
      }

      // Фильтрация школ по типу образования
      if (
        updatedFilters.educationType &&
        updatedFilters.educationType.length > 0
      ) {
        filteredSchools = filteredSchools.filter((school) =>
          updatedFilters.educationType!.some((type) =>
            school.properties.types_of_educational_institutions
              .toLowerCase()
              .includes(type.toLowerCase())
          )
        );
        console.log(
          "📚 Education type filtered schools:",
          filteredSchools.length
        );
      }

      // Фильтрация школ по форме собственности
      if (updatedFilters.isPrivate !== null) {
        const isPrivateSchool = (ownership: string) =>
          ownership.toLowerCase().includes("частн") ||
          ownership.toLowerCase().includes("собственность граждан");

        filteredSchools = filteredSchools.filter((school) => {
          const isPrivate = isPrivateSchool(
            school.properties.form_of_ownership
          );
          return updatedFilters.isPrivate ? isPrivate : !isPrivate;
        });
        console.log("🏛️ Ownership filtered schools:", filteredSchools.length);
      }

      console.log("📍 Filtered results:", {
        polygons: filteredPolygons.length,
        schools: filteredSchools.length,
      });

      return {
        ...prev,
        filters: updatedFilters,
        filteredPolygons,
        filteredSchools,
      };
    });
  }, []);

  // Получение уникальных школ для автокомплита
  const getUniqueSchools = useCallback(() => {
    return BalanceEnrichedService.getUniqueSchools(
      state.schoolLanguageMappings
    );
  }, [state.schoolLanguageMappings]);

  // Получение уникальных районов из школ
  const getUniqueDistricts = useCallback(() => {
    const districts = state.schools.map((school) => school.properties.district);
    const uniqueDistricts = [...new Set(districts)].filter(Boolean).sort();
    console.log("🏘️ Unique districts:", uniqueDistricts);
    return uniqueDistricts;
  }, [state.schools]);

  // Получение уникальных типов образования
  const getUniqueEducationTypes = useCallback(() => {
    const types = state.schools.flatMap((school) =>
      school.properties.types_of_educational_institutions
        .split(",")
        .map((type) => type.trim())
        .filter(Boolean)
    );
    const uniqueTypes = [...new Set(types)].sort();
    console.log("📚 Unique education types:", uniqueTypes);
    return uniqueTypes;
  }, [state.schools]);

  // Получение доступных языков для выбранной школы
  const getAvailableLanguages = useCallback(
    (schoolNumber?: string) => {
      if (!schoolNumber) return [];

      const mappings = state.schoolLanguageMappings.filter(
        (m) => m.schoolNumber === schoolNumber
      );

      return [...new Set(mappings.map((m) => m.language))];
    },
    [state.schoolLanguageMappings]
  );

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: initialFilters,
      filteredPolygons: prev.districtPolygons,
      filteredSchools: prev.schools,
    }));
  }, []);

  // Выбор школы
  const selectSchool = useCallback(
    (schoolNumber: string | undefined) => {
      applyFilters({ selectedSchool: schoolNumber });
    },
    [applyFilters]
  );

  // Выбор языка
  const selectLanguage = useCallback(
    (language: "bilingual" | "kazakh" | "russian" | "uyghur" | null) => {
      applyFilters({ selectedLanguage: language });
    },
    [applyFilters]
  );

  // Поиск школы
  const searchSchool = useCallback(
    (query: string) => {
      applyFilters({ schoolSearchQuery: query });
    },
    [applyFilters]
  );

  // Выбор районов
  const selectDistricts = useCallback(
    (districts: string[]) => {
      applyFilters({ district: districts });
    },
    [applyFilters]
  );

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    loadData,
    applyFilters,
    resetFilters,
    selectSchool,
    selectLanguage,
    searchSchool,
    selectDistricts,
    getUniqueSchools,
    getUniqueDistricts,
    getUniqueEducationTypes,
    getAvailableLanguages,
  };
}
