"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AnimatePresence } from "framer-motion";
import SchoolDetailPopup from "@/components/schools/school-detail-popup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRatingZone } from "@/lib/rating-utils";

import {
  School,
  Trophy,
  Users,
  Star,
  TrendingDown,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import {
  StatCard,
  SchoolCard,
  SchoolsTable,
  SearchAndFilters,
  Charts,
  PageHeader,
  WelcomeBanner,
  EmptyState,
  type CombinedSchool,
} from "@/components/schools/rating";

// Import integrated service
import { IntegratedSchoolsService } from "@/services/integrated-schools.service";

// Type definitions
interface StatsData {
  totalSchools: number;
  topRated: number;
  averageRating: number;
  totalStudents: number;
  totalTeachers: number;
  lowPerformance: number;
}

interface DistrictData {
  id: string;
  name: string;
  schools: number;
  highRated: number;
  mediumRated: number;
  lowRated: number;
}

interface SchoolsPageProps {
  params: { lang: string };
}

function SchoolsRatingPage({ params }: SchoolsPageProps) {
  const { logout } = useAuth();

  // State management
  const [schools, setSchools] = useState<CombinedSchool[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [selectedSchool, setSelectedSchool] = useState<CombinedSchool | null>(
    null
  );
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  // Rating info helper function
  const getRatingInfo = (rating: number | null | undefined) => {
    if (!rating) {
      return {
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        icon: AlertTriangle,
      };
    }

    const zone = getRatingZone(rating);
    switch (zone) {
      case "green":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: CheckCircle,
        };
      case "yellow":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: TrendingUp,
        };
      case "red":
        return {
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: AlertTriangle,
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-100",
          icon: AlertTriangle,
        };
    }
  };

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Попробуем загрузить данные, но с fallback на моковые данные
        try {
          // Загружаем школы
          const schoolsData = await IntegratedSchoolsService.getSchools();

          // Загружаем статистику
          const overallStats = await IntegratedSchoolsService.getOverallStats();

          // Загружаем данные о районах
          const districtStatsData =
            await IntegratedSchoolsService.getDistrictStats();

          // Преобразуем данные о школах в нужный формат
          const transformedSchools = schoolsData.map((school) => ({
            id: parseInt(school.id),
            name_of_the_organization: school.nameRu,
            district: school.district.nameRu,
            types_of_educational_institutions: school.organizationType,
            gis_rating: school.currentRating,
            academic_results_rating: school.indicators.K,
            pedagogical_potential_rating: school.indicators.P,
            safety_climate_rating: school.indicators.M,
            infrastructure_rating: school.indicators.A,
            graduate_success_rating: school.indicators.C,
            penalty_rating: school.indicators.V,
            digital_rating: school.currentRating,
          }));

          // Преобразуем статистику
          const transformedStats = {
            totalSchools: overallStats.totalSchools,
            topRated: overallStats.greenZone,
            averageRating: overallStats.averageRating,
            totalStudents: schoolsData.length * 300, // Приблизительный подсчет
            totalTeachers: 0, // TODO: Добавить подсчет учителей
            lowPerformance: overallStats.redZone,
          };

          // Преобразуем данные о районах
          const transformedDistricts = districtStatsData.map((d) => ({
            id: d.district.id,
            name: d.district.nameRu,
            schools: d.totalSchools,
            highRated: d.greenZone,
            mediumRated: d.yellowZone,
            lowRated: d.redZone,
          }));

          setSchools(transformedSchools as CombinedSchool[]);
          setStats(transformedStats);
          setDistricts(transformedDistricts);
        } catch (apiError) {
          console.warn("API недоступен, используем моковые данные:", apiError);

          // Fallback на моковые данные
          const mockSchools = [
            {
              id: 1,
              name_of_the_organization:
                "Школа-лицей №165 имени Гани Муратбаева",
              types_of_educational_institutions: "Государственное учреждение",
              district: "Алмалинский район",
              gis_rating: 4.5,
              academic_results_rating: 85,
              pedagogical_potential_rating: 90,
              safety_climate_rating: 88,
              infrastructure_rating: 82,
              graduate_success_rating: 87,
              penalty_rating: 95,
              digital_rating: 86,
            },
            {
              id: 2,
              name_of_the_organization: "Гимназия №148",
              types_of_educational_institutions: "Государственное учреждение",
              district: "Бостандыкский район",
              gis_rating: 4.2,
              academic_results_rating: 78,
              pedagogical_potential_rating: 82,
              safety_climate_rating: 85,
              infrastructure_rating: 75,
              graduate_success_rating: 80,
              penalty_rating: 90,
              digital_rating: 79,
            },
          ];

          const mockStats = {
            totalSchools: 450,
            topRated: 85,
            averageRating: 4.1,
            totalStudents: 125000,
            totalTeachers: 8500,
            lowPerformance: 25,
          };

          const mockDistricts = [
            {
              id: "almalinsky",
              name: "Алмалинский район",
              schools: 65,
              highRated: 15,
              mediumRated: 35,
              lowRated: 15,
            },
            {
              id: "bostandyksky",
              name: "Бостандыкский район",
              schools: 72,
              highRated: 18,
              mediumRated: 40,
              lowRated: 14,
            },
          ];

          setSchools(mockSchools);
          setStats(mockStats);
          setDistricts(mockDistricts);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtered data
  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name_of_the_organization
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDistrict =
      selectedDistrict === "all" || school.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  // Event handlers
  const handleSchoolSelect = (school: CombinedSchool) => {
    setSelectedSchool(school);
    setShowDetailPopup(true);
  };

  const handleCloseDetailPopup = () => {
    setShowDetailPopup(false);
    setSelectedSchool(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedDistrict("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <PageHeader
        userName="Пользователь"
        onLogout={logout}
        lang={params.lang}
      />

      <div className="max-w-7xl mx-auto p-4 pt-8 space-y-8">
        <WelcomeBanner /> {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Всего школ"
              value={stats.totalSchools}
              subtitle="учреждений"
              icon={<School className="h-4 w-4" />}
              variant="default"
            />
            <StatCard
              title="Топ рейтинг"
              value={stats.topRated}
              subtitle="школ"
              icon={<Trophy className="h-4 w-4" />}
              variant="success"
            />
            <StatCard
              title="Ср. рейтинг"
              value={stats.averageRating}
              subtitle="балл"
              icon={<Star className="h-4 w-4" />}
              variant="warning"
            />
            <StatCard
              title="Учеников"
              value={stats.totalStudents}
              subtitle="человек"
              icon={<Users className="h-4 w-4" />}
              variant="default"
            />
            <StatCard
              title="Учителей"
              value={stats.totalTeachers}
              subtitle="человек"
              icon={<Target className="h-4 w-4" />}
              variant="default"
            />
            <StatCard
              title="Низкий рейтинг"
              value={stats.lowPerformance}
              subtitle="школ"
              icon={<TrendingDown className="h-4 w-4" />}
              variant="danger"
            />
          </div>
        )}
        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schools">Список школ</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6">
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onExport={() => console.log("Export")}
            />

            {filteredSchools.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map((school) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    onView={handleSchoolSelect}
                  />
                ))}
              </div>
            ) : (
              <SchoolsTable
                schools={filteredSchools}
                setSchools={setSchools}
                onRowClick={handleSchoolSelect}
                onView={handleSchoolSelect}
                selectedDistrict={selectedDistrict}
                searchQuery={searchTerm}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Charts
              data={districts.map((d) => ({
                district: d.name,
                count: d.schools,
                high: d.highRated,
                medium: d.mediumRated,
                low: d.lowRated,
              }))}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {showDetailPopup && selectedSchool && (
          <SchoolDetailPopup
            isOpen={showDetailPopup}
            school={selectedSchool}
            onClose={handleCloseDetailPopup}
            getRatingInfo={getRatingInfo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(SchoolsRatingPage);
