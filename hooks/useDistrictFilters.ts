import { useState, useEffect, useCallback } from "react";
import {
  MapState,
  MapFilters,
  SchoolLanguageMapping,
  DistrictPolygon,
  BalanceEnrichedItem,
  SchoolProperties,
} from "@/types/schools-map";
import { BalanceEnrichedService } from "@/services/balance-enriched.service";
import { SchoolsMapService } from "@/services/schools-map.service";

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
      const [balanceData, schoolsData] = await Promise.all([
        BalanceEnrichedService.getBalanceEnrichedData(),
        BalanceEnrichedService.getSchoolsData(),
      ]);

      console.log("📊 Loaded data:", {
        balanceData: balanceData,
        balanceDataType: typeof balanceData,
        balanceDataIsArray: Array.isArray(balanceData),
        balanceItems: Array.isArray(balanceData)
          ? balanceData.length
          : "not array",
        schools: Array.isArray(schoolsData) ? schoolsData.length : "not array",
      });

      // Создаем маппинги школ по языкам
      const mappings = BalanceEnrichedService.createSchoolLanguageMappings(
        balanceData,
        schoolsData
      );

      console.log("🗺️ Created school mappings:", mappings.length);

      // Создаем полигоны из balance data
      const districtPolygons: DistrictPolygon[] = balanceData
        .filter((item) => item.geometry)
        .map((item) => ({
          id: item.id,
          type: "Feature" as const,
          geometry: item.geometry,
          properties: item,
        }));

      // Конвертируем школы в SchoolFeature формат (если нужно)
      const schoolFeatures = schoolsData
        .filter((school) => school.infra?.origin_marker)
        .map((school) => ({
          id: school.id,
          type: "Feature" as const,
          geometry: school.infra!.origin_marker,
          properties: school,
        }));

      setState((prev) => ({
        ...prev,
        balanceData,
        schools: schoolFeatures,
        filteredSchools: schoolFeatures,
        districtPolygons,
        schoolLanguageMappings: mappings,
        filteredPolygons: districtPolygons,
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

      // Фильтруем полигоны по школе и языку
      let filteredPolygons = BalanceEnrichedService.filterPolygonsBySchool(
        prev.schoolLanguageMappings,
        updatedFilters.selectedSchool,
        updatedFilters.selectedLanguage
      );

      // Дополнительная фильтрация по поиску школы
      if (updatedFilters.schoolSearchQuery) {
        console.log(
          "🔍 Searching for schools with query:",
          updatedFilters.schoolSearchQuery
        );
        console.log(
          "📊 Total mappings available:",
          prev.schoolLanguageMappings.length
        );
        console.log(
          "📋 First 3 mappings:",
          prev.schoolLanguageMappings.slice(0, 3).map((m) => ({
            schoolNumber: m.schoolNumber,
            language: m.language,
            hasSchoolInfo: !!m.schoolInfo,
            schoolName: m.schoolInfo?.name_of_the_organization,
            polygonsCount: m.districtPolygons.length,
          }))
        );

        const searchResults = BalanceEnrichedService.searchSchools(
          prev.schoolLanguageMappings,
          updatedFilters.schoolSearchQuery
        );

        // Берем полигоны из результатов поиска (без дополнительной фильтрации)
        filteredPolygons = [];
        searchResults.forEach((mapping) => {
          filteredPolygons.push(...mapping.districtPolygons);
        });

        console.log("🔍 Search results mappings:", searchResults.length);
        console.log("🗺️ Polygons from search:", filteredPolygons.length);
      }

      // Фильтруем школы (если нужно)
      let filteredSchools = prev.schools;
      if (updatedFilters.schoolSearchQuery) {
        const query = updatedFilters.schoolSearchQuery.toLowerCase();
        filteredSchools = prev.schools.filter((school) =>
          school.properties.name_of_the_organization
            .toLowerCase()
            .includes(query)
        );
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
    getUniqueSchools,
    getAvailableLanguages,
  };
}
