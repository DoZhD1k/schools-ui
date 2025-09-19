"use client";

import dynamic from "next/dynamic";
import { useSchoolsMap } from "@/hooks/useSchoolsMap";
import SchoolsMapFilters from "@/components/map/SchoolsMapFilters";
import MapLoading from "@/components/map/MapLoading";

// Dynamically import the SchoolsMapContainer to avoid SSR issues with mapbox-gl
const SchoolsMapContainer = dynamic(
  () => import("@/components/map/SchoolsMapContainer"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapPage() {
  const {
    filteredSchools,
    selectedSchool,
    filters,
    loading,
    error,
    applyFilters,
    resetFilters,
    selectSchool,
    getFilterOptions,
    getStatistics,
  } = useSchoolsMap();

  if (loading) {
    return (
      <div className="h-[100vh] w-full flex items-center justify-center">
        <div className="text-center">
          <MapLoading />
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[100vh] w-full flex items-center justify-center bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h3 className="font-bold text-red-600 mb-2">
            Ошибка загрузки данных
          </h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
      <SchoolsMapContainer
        schools={filteredSchools}
        selectedSchool={selectedSchool}
        onSchoolSelect={selectSchool}
      />

      <SchoolsMapFilters
        filters={filters}
        filterOptions={getFilterOptions()}
        statistics={getStatistics()}
        onFiltersChange={applyFilters}
        onReset={resetFilters}
      />
    </div>
  );
}
