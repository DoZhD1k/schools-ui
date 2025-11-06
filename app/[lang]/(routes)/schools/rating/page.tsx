"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { GraduationCap } from "lucide-react";
import { useParams } from "next/navigation";

// Импорт компонентов schools-rating
import DistrictSchoolsChart from "@/components/schools/district-schools-chart";
import RatingZonesChart from "@/components/schools/rating-zones-chart";
import RatingIndicators from "@/components/schools/rating-indicators";
import DetailedRatingsTable from "@/components/schools/detailed-ratings-table";

// Import integrated service
import { IntegratedSchoolsService } from "@/services/integrated-schools.service";
import { Card, CardContent } from "@/components/ui/card";
import { School, District, DistrictStats } from "@/types/schools";

function SchoolsRatingPageClient() {
  const params = useParams() as { lang: string };
  const { lang } = params;
  const { accessToken } = useAuth();

  // State management
  const [schools, setSchools] = useState<School[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setUserName] = useState<string>("Пользователь");

  // Decode JWT to get username
  useEffect(() => {
    if (accessToken && typeof accessToken === "string") {
      try {
        // Remove "Token " prefix if present
        const token = accessToken.startsWith("Token ")
          ? accessToken.substring(6)
          : accessToken;

        // Check if token has the expected JWT format (3 parts separated by dots)
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          console.warn("Token is not in JWT format");
          return;
        }

        const base64Url = tokenParts[1];
        if (!base64Url) {
          console.warn("Invalid JWT: missing payload");
          return;
        }

        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        if (decoded && decoded.sub) {
          const email = decoded.sub;
          const name = email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    }
  }, [accessToken]);

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Загружаем все данные параллельно
        const [schoolsData, districtsData, districtStatsData] =
          await Promise.all([
            IntegratedSchoolsService.getSchools(),
            IntegratedSchoolsService.getDistricts(),
            IntegratedSchoolsService.getDistrictStats(),
          ]);

        setSchools(schoolsData);
        setDistricts(districtsData);
        setDistrictStats(districtStatsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleExport = async (exportSchools: School[], title: string) => {
    try {
      const exportData = await IntegratedSchoolsService.exportSchools();

      console.log("Экспорт данных:", {
        title,
        count: exportSchools.length,
        data: exportData,
      });

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      alert(`Экспорт "${title}" выполнен успешно!`);
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при экспорте данных");
    }
  };

  const handleViewPassport = (schoolId: string) => {
    window.location.href = `/${lang}/schools/passport/${schoolId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/7 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Общий рейтинг школ
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
              Модуль для анализа рейтинга образовательных организаций города
              Алматы
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto p-8 space-y-10">
        {/* Общие показатели */}
        {schools && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200/60 bg-gradient-to-br from-white/80 to-slate-50/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Всего школ
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {schools.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "green")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Зеленая зона
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {schools.filter((s) => s.ratingZone === "green").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "yellow")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Желтая зона
                    </p>
                    <p className="text-3xl font-bold text-amber-600">
                      {schools.filter((s) => s.ratingZone === "yellow").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-red-200/60 bg-gradient-to-br from-red-50/80 to-white backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {schools.length > 0
                        ? Math.round(
                            (schools.filter((s) => s.ratingZone === "red")
                              .length /
                              schools.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                      Красная зона
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {schools.filter((s) => s.ratingZone === "red").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Графики распределения школ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DistrictSchoolsChart
            districtStats={districtStats}
            schools={schools}
            onExport={handleExport}
          />
          <RatingZonesChart
            districtStats={districtStats}
            schools={schools}
            onExport={handleExport}
          />
        </div>

        {/* Круговые индикаторы рейтинга */}
        <RatingIndicators schools={schools} onExport={handleExport} />

        {/* Главная таблица рейтингов с пагинацией */}
        <DetailedRatingsTable
          schools={schools}
          districts={districts}
          onExport={handleExport}
          onViewPassport={handleViewPassport}
        />
      </div>
    </div>
  );
}

export default withAuth(SchoolsRatingPageClient);
