"use client";

import dynamic from "next/dynamic";
import { useDistrictFilters } from "@/hooks/useDistrictFilters";
import { MapProvider } from "@/contexts/map-context";
import DistrictFilters from "@/components/map/DistrictFilters";
import MapLoading from "@/components/map/MapLoading";

// Dynamically import the MapWithPolygons to avoid SSR issues with mapbox-gl
const MapWithPolygons = dynamic(
  () => import("@/components/map/MapWithPolygons"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapPage() {
  const {
    loading,
    error,
    filteredPolygons,
    filteredSchools,
    filters,
    selectSchool,
    selectLanguage,
    searchSchool,
    resetFilters,
    getUniqueSchools,
    getAvailableLanguages,
  } = useDistrictFilters();

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
    <MapProvider>
      <div className="relative h-[100vh] w-full overflow-hidden">
        <MapWithPolygons
          schools={filteredSchools}
          selectedSchool={null}
          onSchoolSelect={() => {}}
          mode="polygons"
          districtPolygons={filteredPolygons}
        />

        {/* Новые фильтры для районов */}
        <div className="absolute top-4 left-4 z-20 max-w-md">
          <DistrictFilters
            selectedSchool={filters.selectedSchool}
            selectedLanguage={filters.selectedLanguage}
            schoolSearchQuery={filters.schoolSearchQuery}
            uniqueSchools={getUniqueSchools()}
            filteredSchoolsCount={filteredSchools.length}
            availableLanguages={getAvailableLanguages(filters.selectedSchool)}
            onSchoolSelect={selectSchool}
            onLanguageSelect={selectLanguage}
            onSchoolSearch={searchSchool}
            onReset={resetFilters}
          />
        </div>
      </div>
    </MapProvider>
  );
}
