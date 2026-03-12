import { useState, useEffect, useCallback } from "react";
import { SchoolFeature, MapFilters, MapState } from "@/types/schools-map";
import { SchoolsMapService } from "@/services/schools-map.service";

export const useSchoolsMap = () => {
  const [state, setState] = useState<MapState>({
    schools: [],
    filteredSchools: [],
    balanceData: [],
    districtPolygons: [],
    schoolLanguageMappings: [],
    filteredPolygons: [],
    filters: {},
    loading: true,
    error: null,
    selectedSchool: null,
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const schools = await SchoolsMapService.fetchSchools();
        setState((prev) => ({
          ...prev,
          schools,
          filteredSchools: schools,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Произошла ошибка при загрузке данных",
        }));
      }
    };

    loadSchools();
  }, []);

  // Применение фильтров
  const applyFilters = useCallback((newFilters: MapFilters) => {
    setState((prev) => {
      const filteredSchools = SchoolsMapService.filterSchools(
        prev.schools,
        newFilters
      );
      console.log("Applying filters:", newFilters);
      console.log("Total schools:", prev.schools.length);
      console.log("Filtered schools:", filteredSchools.length);
      return {
        ...prev,
        filters: newFilters,
        filteredSchools,
      };
    });
  }, []);

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      filteredSchools: prev.schools,
    }));
  }, []);

  // Выбор школы
  const selectSchool = useCallback((school: SchoolFeature | null) => {
    setState((prev) => ({
      ...prev,
      selectedSchool: school,
    }));
  }, []);

  // Получение уникальных значений для фильтров
  const getFilterOptions = useCallback(() => {
    return {
      districts: SchoolsMapService.getUniqueDistricts(state.schools),
      educationTypes: SchoolsMapService.getUniqueEducationTypes(state.schools),
    };
  }, [state.schools]);

  // Получение статистики
  const getStatistics = useCallback(() => {
    return SchoolsMapService.getSchoolsStatistics(state.filteredSchools);
  }, [state.filteredSchools]);

  return {
    ...state,
    applyFilters,
    resetFilters,
    selectSchool,
    getFilterOptions,
    getStatistics,
  };
};
