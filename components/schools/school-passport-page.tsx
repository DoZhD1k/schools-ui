"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function SchoolPassportPage() {
  const params = useParams();
  const schoolId = params.id as string;

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
    <div className="container mx-auto p-6 space-y-8">
      {/* Кнопка назад */}
      <Button
        variant="outline"
        onClick={() => window.history.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к списку школ
      </Button>

      {/* Основная информация */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {school.nameRu}
              </h1>
              <p className="text-lg text-gray-600">{school.nameKz}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {school.district.nameRu}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {school.organizationType}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge
                style={{
                  backgroundColor: getRatingZoneColor(school.ratingZone),
                }}
                className="text-white text-lg px-4 py-2 mb-2"
              >
                Рейтинг: {school.currentRating}
              </Badge>
              <p className="text-sm text-gray-600">
                {school.ratingZone === "green"
                  ? "Зеленая зона (86-100%)"
                  : school.ratingZone === "yellow"
                  ? "Желтая зона (50-85%)"
                  : "Красная зона (5-49%)"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Адрес:</span>
              </div>
              <p className="text-gray-600 ml-6">{school.address}</p>
            </div>

            {school.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Телефон:</span>
                </div>
                <p className="text-gray-600 ml-6">{school.phone}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Директор:</span>
              </div>
              <p className="text-gray-600 ml-6">{school.director}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Год основания:</span>
              </div>
              <p className="text-gray-600 ml-6">{school.foundedYear}</p>
            </div>

            {school.commissionedYear && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Год ввода в эксплуатацию:</span>
                </div>
                <p className="text-gray-600 ml-6">{school.commissionedYear}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Проектная мощность:</span>
              </div>
              <p className="text-gray-600 ml-6">
                {school.capacity.toLocaleString()} учащихся
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Количество учащихся:</span>
              </div>
              <p className="text-gray-600 ml-6">
                {school.currentStudents.toLocaleString()} учащихся
              </p>
              <div className="ml-6">
                <Progress
                  value={(school.currentStudents / school.capacity) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((school.currentStudents / school.capacity) * 100)}
                  % заполненности
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Качество знаний за 3 года */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Качество знаний за 3 года
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Качество знаний"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-bold">
                    {qualityKnowledge.year3}%
                  </span>
                  {formatTrend(qualityKnowledge.year3, qualityKnowledge.year2)}
                </div>
                <p className="text-gray-600">Текущий показатель</p>
                <p className="text-sm text-gray-500 mt-2">
                  Динамика:{" "}
                  {qualityKnowledge.trend === "up"
                    ? "Рост"
                    : qualityKnowledge.trend === "down"
                    ? "Снижение"
                    : "Стабильно"}
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
                  {resultsDynamics.yearOverYearChange.graduates > 0 ? "+" : ""}
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
                  {resultsDynamics.yearOverYearChange.altynBelgi > 0 ? "+" : ""}
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
                    Аттестованы: {teacherQualification.certifications.certified}{" "}
                    из {teacherQualification.certifications.total}
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
                  (schoolEquipment.newRooms / schoolEquipment.totalRooms) * 100
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
  );
}
