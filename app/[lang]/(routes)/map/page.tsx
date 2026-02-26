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
import { Filter, X, ChevronUp } from "lucide-react";

const MapWithPolygons = dynamic(
  () => import("@/components/map/MapWithPolygons"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
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
            s.nameRu === school.properties.name_of_the_organization,
        );
        setSelectedSchoolWithRating(schoolWithRating || null);
      } else {
        setSelectedSchoolWithRating(null);
      }
    },
    [schoolsWithRatings],
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
      <div className="flex flex-col md:flex-row h-[calc(100dvh-57px)] md:h-[100vh] w-full overflow-hidden bg-[#f8f9fb]">
        {/* Левая панель — скрыта на мобилке, показывается как выдвижная панель */}
        <MobileFilterPanel
          filters={filters}
          filteredSchools={filteredSchools}
          filteredPolygons={filteredPolygons}
          selectSchool={selectSchool}
          searchSchool={searchSchool}
          resetFilters={resetFilters}
          getUniqueSchools={getUniqueSchools}
          getUniqueDistricts={getUniqueDistricts}
          selectDistricts={selectDistricts}
          ratingsLoading={ratingsLoading}
          schoolsWithRatings={schoolsWithRatings}
        />

        {/* Desktop: левая панель */}
        <div className="hidden md:flex w-[280px] bg-white border-r p-4 flex-col gap-4 shadow-sm overflow-y-auto">
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
        <div className="flex-1 relative min-h-0">
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

        {/* Правая панель — на мобилке как нижний sheet */}
        <MobileSchoolPanel selectedSchool={selectedSchoolWithRating} />

        {/* Desktop: правая панель */}
        <div className="hidden md:block w-[320px] bg-white border-l shadow-sm overflow-y-auto">
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

/* Мобильная панель фильтров */
function MobileFilterPanel({
  filters,
  filteredSchools,
  filteredPolygons,
  selectSchool,
  searchSchool,
  resetFilters,
  getUniqueSchools,
  getUniqueDistricts,
  selectDistricts,
  ratingsLoading,
  schoolsWithRatings,
}: {
  filters: ReturnType<typeof useDistrictFilters>["filters"];
  filteredSchools: SchoolFeature[];
  filteredPolygons: unknown[];
  selectSchool: (v: string | undefined) => void;
  searchSchool: (v: string) => void;
  resetFilters: () => void;
  getUniqueSchools: () => unknown[];
  getUniqueDistricts: () => string[];
  selectDistricts: (v: string[]) => void;
  ratingsLoading: boolean;
  schoolsWithRatings: School[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-3 left-3 z-20 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200"
      >
        <Filter className="h-4 w-4" />
        Фильтры
        {filteredSchools.length > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
            {filteredSchools.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-white shadow-xl overflow-y-auto p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Фильтры</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
                aria-label="Закрыть фильтры"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <UnifiedFilters
              selectedSchool={filters.selectedSchool}
              schoolSearchQuery={filters.schoolSearchQuery}
              uniqueSchools={getUniqueSchools() as never[]}
              uniqueDistricts={getUniqueDistricts()}
              selectedDistricts={filters.district || []}
              filteredSchoolsCount={filteredSchools.length}
              filteredPolygonsCount={filteredPolygons.length}
              onSchoolSelect={selectSchool}
              onSchoolSearch={searchSchool}
              onDistrictChange={selectDistricts}
              onReset={() => {
                resetFilters();
                setOpen(false);
              }}
            />
            {ratingsLoading ? (
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <SchoolStatsWithRatings schools={schoolsWithRatings} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Мобильная панель паспорта школы (нижний sheet) */
function MobileSchoolPanel({
  selectedSchool,
}: {
  selectedSchool: School | null;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!selectedSchool) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
      <div
        className={`bg-white border-t border-slate-200 shadow-2xl rounded-t-2xl transition-all duration-300 ${
          expanded ? "max-h-[70vh]" : "max-h-[140px]"
        } overflow-hidden`}
      >
        {/* Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex flex-col items-center pt-2 pb-1"
          aria-label="Развернуть паспорт школы"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full mb-1" />
          <ChevronUp
            className={`h-4 w-4 text-slate-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`overflow-y-auto px-4 pb-4 ${expanded ? "max-h-[calc(70vh-40px)]" : "max-h-[90px]"}`}
        >
          <SchoolPassportWithRating selectedSchool={selectedSchool} />
        </div>
      </div>
    </div>
  );
}
