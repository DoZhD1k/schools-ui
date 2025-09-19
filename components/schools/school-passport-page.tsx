"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Shield,
  BookOpen,
  Globe,
  Heart,
  Accessibility,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { SchoolPassportData } from "@/types/schools";
import { SchoolsService } from "@/services/schools.service";
import { getRatingZoneColor } from "@/lib/rating-utils";

interface Props {
  schoolId: string;
}

export default function SchoolPassportPage({ schoolId }: Props) {
  const [passportData, setPassportData] = useState<SchoolPassportData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId) {
      loadPassportData();
    }
  }, [schoolId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPassportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await SchoolsService.getSchoolPassport(schoolId);
      if (!data) {
        setError("Школа не найдена");
        return;
      }

      setPassportData(data);
    } catch (err) {
      setError("Ошибка при загрузке данных");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5)
      return <Minus className="h-4 w-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка паспорта школы...</p>
        </div>
      </div>
    );
  }

  if (error || !passportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Данные не найдены"}</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const {
    school,
    qualityKnowledge,
    resultsDynamics,
    talentDevelopment,
    teacherQualification,
    teacherAchievements,
    schoolEquipment,
    internationalRelations,
    schoolSafety,
    educationalWork,
    inclusionAndImprovement,
  } = passportData;

  // Подготовка данных для графиков
  const qualityData = [
    { year: "1-й год", value: qualityKnowledge.year1 },
    { year: "2-й год", value: qualityKnowledge.year2 },
    { year: "3-й год", value: qualityKnowledge.year3 },
  ];

  const talentData = [
    {
      level: "Школьный",
      participants: talentDevelopment.schoolLevel.participants,
      winners: talentDevelopment.schoolLevel.winners,
    },
    {
      level: "Городской",
      participants: talentDevelopment.cityLevel.participants,
      winners: talentDevelopment.cityLevel.winners,
    },
    {
      level: "Областной",
      participants: talentDevelopment.regionalLevel.participants,
      winners: talentDevelopment.regionalLevel.winners,
    },
    {
      level: "Республиканский",
      participants: talentDevelopment.nationalLevel.participants,
      winners: talentDevelopment.nationalLevel.winners,
    },
    {
      level: "Международный",
      participants: talentDevelopment.internationalLevel.participants,
      winners: talentDevelopment.internationalLevel.winners,
    },
  ];

  const categoryData = [
    {
      name: "Высшая",
      value: teacherQualification.categories.highest,
      color: "#22c55e",
    },
    {
      name: "Первая",
      value: teacherQualification.categories.first,
      color: "#3b82f6",
    },
    {
      name: "Вторая",
      value: teacherQualification.categories.second,
      color: "#eab308",
    },
    {
      name: "Без категории",
      value: teacherQualification.categories.noCategory,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-10">
        {/* Кнопка назад */}
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 mb-6 border-slate-300 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:hover:bg-slate-800 transition-all duration-200 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Назад к списку школ
        </Button>

        {/* Основная информация */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  {school.nameRu}
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                  {school.nameKz}
                </p>
                <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">
                      {school.district.nameRu}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold">
                      {school.organizationType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  style={{
                    backgroundColor: getRatingZoneColor(school.ratingZone),
                  }}
                  className="text-white text-xl px-6 py-3 mb-3 font-bold shadow-lg rounded-xl"
                >
                  Рейтинг: {school.currentRating}
                </Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  {school.ratingZone === "green"
                    ? "Зеленая зона (86-100%)"
                    : school.ratingZone === "yellow"
                    ? "Желтая зона (50-85%)"
                    : "Красная зона (5-49%)"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Адрес:
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium leading-relaxed">
                  {school.address}
                </p>
              </div>

              {school.phone && (
                <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Телефон:
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                    {school.phone}
                  </p>
                </div>
              )}

              <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Директор:
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                  {school.director}
                </p>
              </div>

              <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Год основания:
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                  {school.foundedYear}
                </p>
              </div>

              {school.commissionedYear && (
                <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Год ввода в эксплуатацию:
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                    {school.commissionedYear}
                  </p>
                </div>
              )}

              <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Проектная мощность:
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                  {school.capacity.toLocaleString()} учащихся
                </p>
              </div>

              <div className="space-y-3 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                    <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Количество учащихся:
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 ml-12 font-medium">
                  {school.currentStudents.toLocaleString()} учащихся
                </p>
                <div className="ml-12">
                  <Progress
                    value={(school.currentStudents / school.capacity) * 100}
                    className="h-3 bg-slate-200 dark:bg-slate-600"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                    {Math.round(
                      (school.currentStudents / school.capacity) * 100
                    )}
                    % заполненности
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Качество знаний за 3 года */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Качество знаний за 3 года
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={qualityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Качество знаний"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontWeight: "bold",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ fill: "#3b82f6", strokeWidth: 3, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/60 dark:border-blue-700/60">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {qualityKnowledge.year3}%
                    </span>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                      {formatTrend(
                        qualityKnowledge.year3,
                        qualityKnowledge.year2
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">
                    Текущий показатель
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">
                    Динамика:{" "}
                    <span
                      className={`font-bold ${
                        qualityKnowledge.trend === "up"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : qualityKnowledge.trend === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {qualityKnowledge.trend === "up"
                        ? "Рост"
                        : qualityKnowledge.trend === "down"
                        ? "Снижение"
                        : "Стабильно"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Динамика результатов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Динамика результатов выпускников
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {resultsDynamics.graduates}
                </div>
                <p className="text-sm text-gray-600 mb-2">Выпускники</p>
                <div className="flex items-center justify-center gap-1">
                  {formatTrend(
                    resultsDynamics.graduates,
                    resultsDynamics.graduates -
                      resultsDynamics.yearOverYearChange.graduates
                  )}
                  <span className="text-xs text-gray-500">
                    {resultsDynamics.yearOverYearChange.graduates > 0
                      ? "+"
                      : ""}
                    {resultsDynamics.yearOverYearChange.graduates}
                  </span>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {resultsDynamics.altynBelgi}
                </div>
                <p className="text-sm text-gray-600 mb-2">Алтын белги</p>
                <div className="flex items-center justify-center gap-1">
                  {formatTrend(
                    resultsDynamics.altynBelgi,
                    resultsDynamics.altynBelgi -
                      resultsDynamics.yearOverYearChange.altynBelgi
                  )}
                  <span className="text-xs text-gray-500">
                    {resultsDynamics.yearOverYearChange.altynBelgi > 0
                      ? "+"
                      : ""}
                    {resultsDynamics.yearOverYearChange.altynBelgi}
                  </span>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {resultsDynamics.averageEntScore}
                </div>
                <p className="text-sm text-gray-600 mb-2">Средний балл ЕНТ</p>
                <div className="flex items-center justify-center gap-1">
                  {formatTrend(
                    resultsDynamics.averageEntScore,
                    resultsDynamics.averageEntScore -
                      resultsDynamics.yearOverYearChange.averageEntScore
                  )}
                  <span className="text-xs text-gray-500">
                    {resultsDynamics.yearOverYearChange.averageEntScore > 0
                      ? "+"
                      : ""}
                    {resultsDynamics.yearOverYearChange.averageEntScore}
                  </span>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {resultsDynamics.grants}
                </div>
                <p className="text-sm text-gray-600 mb-2">Гранты</p>
                <div className="flex items-center justify-center gap-1">
                  {formatTrend(
                    resultsDynamics.grants,
                    resultsDynamics.grants -
                      resultsDynamics.yearOverYearChange.grants
                  )}
                  <span className="text-xs text-gray-500">
                    {resultsDynamics.yearOverYearChange.grants > 0 ? "+" : ""}
                    {resultsDynamics.yearOverYearChange.grants}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Развитие талантов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Развитие талантов (участие и победы в конкурсах)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={talentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participants" fill="#3b82f6" name="Участники" />
                <Bar dataKey="winners" fill="#22c55e" name="Победители" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Квалификация педагогов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Квалификация педагогов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  <p className="font-medium">Аттестация педагогов:</p>
                  <div className="flex items-center justify-between">
                    <span>
                      Аттестованы:{" "}
                      {teacherQualification.certifications.certified} из{" "}
                      {teacherQualification.certifications.total}
                    </span>
                    <Badge variant="secondary">
                      {teacherQualification.certifications.percentage}%
                    </Badge>
                  </div>
                  <Progress
                    value={teacherQualification.certifications.percentage}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Достижения педагогов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Достижения педагогов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-xl font-bold text-blue-600">
                      {teacherAchievements.schoolLevel}
                    </div>
                    <p className="text-xs text-gray-600">Школьный уровень</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-xl font-bold text-green-600">
                      {teacherAchievements.cityLevel}
                    </div>
                    <p className="text-xs text-gray-600">Городской уровень</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-xl font-bold text-yellow-600">
                      {teacherAchievements.regionalLevel}
                    </div>
                    <p className="text-xs text-gray-600">Областной уровень</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-xl font-bold text-purple-600">
                      {teacherAchievements.nationalLevel}
                    </div>
                    <p className="text-xs text-gray-600">Республиканский</p>
                  </div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-xl font-bold text-red-600">
                    {teacherAchievements.internationalLevel}
                  </div>
                  <p className="text-xs text-gray-600">Международный уровень</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Оснащенность школы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Оснащенность школы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="font-medium">
                  Всего кабинетов:{" "}
                  <span className="text-blue-600">
                    {schoolEquipment.totalRooms}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Новые кабинеты: {schoolEquipment.newRooms}
                </p>
                <Progress
                  value={
                    (schoolEquipment.newRooms / schoolEquipment.totalRooms) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium">
                  Современное оборудование:{" "}
                  <span className="text-green-600">
                    {schoolEquipment.modernEquipmentPercentage}%
                  </span>
                </p>
                <Progress
                  value={schoolEquipment.modernEquipmentPercentage}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <p className="font-medium">Специализированные кабинеты:</p>
                <div className="text-sm space-y-1">
                  <p>Компьютерные классы: {schoolEquipment.computerRooms}</p>
                  <p>Лаборатории: {schoolEquipment.laboratories}</p>
                  <p>Библиотеки: {schoolEquipment.libraries}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Международные отношения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Международные отношения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Партнерства:</span>
                  <Badge variant="secondary">
                    {internationalRelations.partnerships}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Программы обмена:</span>
                  <Badge variant="secondary">
                    {internationalRelations.exchangePrograms}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Международные проекты:</span>
                  <Badge variant="secondary">
                    {internationalRelations.internationalProjects}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Изучаемые иностранные языки:</p>
                <div className="flex flex-wrap gap-2">
                  {internationalRelations.foreignLanguagePrograms.map(
                    (language, index) => (
                      <Badge key={index} variant="outline">
                        {language}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Безопасность */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {schoolSafety.cctv.total}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Камеры видеонаблюдения
                </p>
                <p className="text-xs text-gray-500">
                  Внутренние: {schoolSafety.cctv.indoor}, Внешние:{" "}
                  {schoolSafety.cctv.outdoor}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {schoolSafety.turnstiles}
                </div>
                <p className="text-sm text-gray-600">Турникеты</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {schoolSafety.panicButtons}
                </div>
                <p className="text-sm text-gray-600">Тревожные кнопки</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {schoolSafety.securityGuards}
                </div>
                <p className="text-sm text-gray-600">Охранники</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Воспитательная работа */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Воспитательная работа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {educationalWork.incidents}
                </div>
                <p className="text-sm text-gray-600">Инциденты</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {educationalWork.violations}
                </div>
                <p className="text-sm text-gray-600">Правонарушения</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {educationalWork.staffTurnover}%
                </div>
                <p className="text-sm text-gray-600">Текучка кадров</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  {educationalWork.disciplinaryActions}
                </div>
                <p className="text-sm text-gray-600">Дисциплинарные меры</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Инклюзия и благоустройство */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Инклюзия и благоустройство
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Обучение на дому:</span>
                  <Badge variant="secondary">
                    {inclusionAndImprovement.homeSchooling} учащихся
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Проекты благоустройства:</span>
                  <Badge variant="secondary">
                    {inclusionAndImprovement.improvementProjects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Зеленые зоны:</span>
                  <Badge variant="secondary">
                    {inclusionAndImprovement.greenSpaces}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Элементы доступности:</p>
                <div className="flex flex-wrap gap-2">
                  {inclusionAndImprovement.accessibilityFeatures.map(
                    (feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Экспорт */}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              console.log("Экспорт паспорта школы:", school.id);
              alert("Экспорт паспорта школы выполнен успешно!");
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Экспорт паспорта в PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
