"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDistrictFilters } from "@/hooks/useDistrictFilters";
import { IntegratedSchoolsService } from "@/services/integrated-schools.service";
import { MapProvider } from "@/contexts/map-context";
import UnifiedFilters from "@/components/map/UnifiedFilters";
import MapLoading from "@/components/map/MapLoading";
import SchoolPassportWithRating from "@/components/map/SchoolPassportWithRating";
import SchoolStatsWithRatings from "@/components/map/SchoolStatsWithRatings";
import { SchoolFeature } from "@/types/schools-map";
import { School } from "@/types/schools";

const MapWithPolygons = dynamic(
  () => import("@/components/map/MapWithPolygons"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapPage() {
  const [selectedSchoolForPassport, setSelectedSchoolForPassport] =
    useState<SchoolFeature | null>(null);
  const [selectedSchoolWithRating, setSelectedSchoolWithRating] =
    useState<School | null>(null);
  const [schoolsWithRatings, setSchoolsWithRatings] = useState<School[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const {
    loading,
    error,
    filteredPolygons,
    filteredSchools,
    filters,
    selectSchool,
    searchSchool,
    resetFilters,
    getUniqueSchools,
    getUniqueDistricts,
    selectDistricts,
  } = useDistrictFilters();

  // Загружаем школы с рейтингами
  useEffect(() => {
    const loadSchoolsWithRatings = async () => {
      try {
        setRatingsLoading(true);
        const schools = await IntegratedSchoolsService.getSchools();
        setSchoolsWithRatings(schools);
      } catch (error) {
        console.error("Error loading schools with ratings:", error);
      } finally {
        setRatingsLoading(false);
      }
    };

    loadSchoolsWithRatings();
  }, []);

  const handleSchoolSelect = useCallback(
    (school: SchoolFeature | null) => {
      setSelectedSchoolForPassport(school);

      // Найдем соответствующую школу с рейтингом по ID
      if (school && schoolsWithRatings.length > 0) {
        const schoolWithRating = schoolsWithRatings.find(
          (s) =>
            s.id === school.id.toString() ||
            s.nameRu === school.properties.name_of_the_organization
        );
        setSelectedSchoolWithRating(schoolWithRating || null);
      } else {
        setSelectedSchoolWithRating(null);
      }
    },
    [schoolsWithRatings]
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <MapLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-red-50">
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
      <div className="flex h-[100vh] w-full overflow-hidden bg-[#f8f9fb]">
        {/* Левая панель */}
        <div className="w-[280px] bg-white border-r p-4 flex flex-col gap-4 shadow-sm">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <UnifiedFilters
            selectedSchool={filters.selectedSchool}
            schoolSearchQuery={filters.schoolSearchQuery}
            uniqueSchools={getUniqueSchools()}
            uniqueDistricts={getUniqueDistricts()}
            selectedDistricts={filters.district || []}
            filteredSchoolsCount={filteredSchools.length}
            filteredPolygonsCount={filteredPolygons.length}
            onSchoolSelect={selectSchool}
            onSchoolSearch={searchSchool}
            onDistrictChange={selectDistricts}
            onReset={resetFilters}
          />

          {/* Статистика школ по зонам */}
          {ratingsLoading ? (
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <SchoolStatsWithRatings schools={schoolsWithRatings} />
          )}
        </div>

        {/* Центральная часть — карта */}
        <div className="flex-1 relative">
          <div className="h-full w-full rounded-none shadow-none m-0 p-0 border">
            <MapWithPolygons
              schools={filteredSchools}
              selectedSchool={selectedSchoolForPassport}
              onSchoolSelect={handleSchoolSelect}
              mode="polygons"
              districtPolygons={filteredPolygons}
              schoolsWithRatings={schoolsWithRatings}
            />
          </div>
        </div>

        {/* Правая панель */}
        <div className="w-[320px] bg-white border-l shadow-sm">
          <div className="h-full">
            <SchoolPassportWithRating
              selectedSchool={selectedSchoolWithRating}
            />
          </div>
        </div>
      </div>
    </MapProvider>
  );
}
