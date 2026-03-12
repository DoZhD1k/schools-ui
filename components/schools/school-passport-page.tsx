"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  GraduationCap,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Shield,
  Award,
  Book,
  MapPin,
  Phone,
  User,
  Calendar,
} from "lucide-react";

import { SchoolPassportData } from "@/types/schools";
import { SchoolsService } from "@/services/integrated-schools.service";
import { getRatingZoneColor, formatRatingTrend } from "@/lib/rating-utils";

export default function SchoolPassportPage() {
  const params = useParams();
  const schoolId = params.id as string;

  const [passportData, setPassportData] = useState<SchoolPassportData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPassportData();
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
      setError("Ошибка при загрузке данных паспорта");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!passportData) return;

    try {
      // Здесь можно интегрировать библиотеку для экспорта в PDF/Excel
      const exportData = {
        school: passportData.school,
        timestamp: new Date().toISOString(),
        data: passportData,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `school_passport_${passportData.school.id}.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      alert("Паспорт школы экспортирован успешно!");
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при экспорте паспорта");
    }
  };

  const formatTrend = (current: number, previous: number) => {
    const trend = formatRatingTrend(current, previous);
    const IconComponent =
      trend.trend === "up"
        ? TrendingUp
        : trend.trend === "down"
        ? TrendingDown
        : Minus;
    const colorClass =
      trend.trend === "up"
        ? "text-green-500"
        : trend.trend === "down"
        ? "text-red-500"
        : "text-gray-400";

    return (
      <div className="flex items-center gap-1">
        <IconComponent className={`h-4 w-4 ${colorClass}`} />
        <span className={colorClass}>{trend.formatted}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            Загрузка паспорта организации...
          </p>
        </div>
      </div>
    );
  }

  if (error || !passportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">
            {error || "Данные не найдены"}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  const school = passportData.school;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-8 space-y-8">
        {/* Заголовок и навигация */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Паспорт организации
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Детальная информация об образовательной организации
              </p>
            </div>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Экспорт паспорта
          </Button>
        </div>

        {/* Основная информация о школе */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              {school.nameRu}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Адрес
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Директор
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.director}
                    </p>
                  </div>
                </div>

                {school.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-lg">
                      <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Телефон
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {school.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Год основания
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.foundedYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 rounded-lg">
                    <Building2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Тип организации
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.organizationType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 rounded-lg">
                    <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Количество учащихся
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.currentStudents} / {school.capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40 rounded-lg">
                    <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Текущий рейтинг
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: getRatingZoneColor(
                            school.ratingZone
                          ),
                        }}
                        className="text-white font-bold"
                      >
                        {school.currentRating}%
                      </Badge>
                      {formatTrend(school.currentRating, school.q3Rating)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Район
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {school.district.nameRu}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Динамика рейтинга */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              Динамика рейтинга по четвертям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  1-я четверть
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {school.q1Rating}%
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  2-я четверть
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {school.q2Rating}%
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  3-я четверть
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {school.q3Rating}%
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Годовой
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {school.yearlyRating}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Показатели рейтинга */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Основные показатели */}
          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/40 rounded-lg">
                  <Book className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                Основные показатели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries({
                  K: "Качество знаний",
                  C: "Динамика результатов",
                  T: "Развитие талантов",
                  P: "Квалификация педагогов",
                  O: "Достижения педагогов",
                }).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                    <Badge variant="outline" className="font-bold">
                      {school.indicators[key as keyof typeof school.indicators]}
                      %
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные показатели */}
          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40 rounded-lg">
                  <Shield className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                Дополнительные показатели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries({
                  A: "Оснащенность школы",
                  B: "Международные отношения",
                  M: "Безопасность",
                  V: "Воспитательная работа",
                  I: "Инклюзия и благоустройство",
                }).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                    <Badge variant="outline" className="font-bold">
                      {school.indicators[key as keyof typeof school.indicators]}
                      %
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Квалификация педагогов */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Квалификация педагогов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Высшая категория
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {passportData.teacherQualification.categories.highest}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Первая категория
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {passportData.teacherQualification.categories.first}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Вторая категория
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {passportData.teacherQualification.categories.second}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Сертифицированы
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {passportData.teacherQualification.certifications.percentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Безопасность и оснащенность */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                Система безопасности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Камеры наблюдения
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolSafety.cctv.total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Турникеты
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolSafety.turnstiles}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Кнопки экстренного вызова
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolSafety.panicButtons}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 rounded-lg">
                  <Building2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                Оснащенность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Всего кабинетов
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolEquipment.totalRooms}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Современное оборудование
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolEquipment.modernEquipmentPercentage.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Компьютерные классы
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolEquipment.computerRooms}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Лаборатории
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {passportData.schoolEquipment.laboratories}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
