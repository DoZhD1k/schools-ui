"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Building2,
  Users,
  MapPin,
  Download,
  User,
  Phone,
  Calendar,
  TrendingUp,
  BookOpen,
  Award,
  Monitor,
  Shield,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

import {
  SchoolPassportService,
  SchoolPassportData,
} from "@/services/school-passport.service";

interface SchoolPassportPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

// Утилита для декодирования JWT токена
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Пустой объект - будем загружать данные из API

function SchoolPassportPage({ params }: SchoolPassportPageProps) {
  const { accessToken } = useAuth();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserName] = useState<string>("Пользователь");
  const [passportData, setPassportData] = useState<SchoolPassportData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolPassport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Загружаем данные паспорта школы используя новый сервис
        const passport = await SchoolPassportService.getSchoolPassport(
          resolvedParams.id
        );

        if (!passport) {
          setError("Данные школы не найдены");
          return;
        }

        setPassportData(passport);
      } catch (err) {
        console.error("Ошибка загрузки паспорта школы:", err);
        setError(
          "Не удалось загрузить данные школы. Проверьте подключение к API."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolPassport();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      if (decoded && decoded.sub) {
        const email = decoded.sub;
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    }
  }, [accessToken]);

  const getRatingZoneColor = (zone: string) => {
    switch (zone) {
      case "green":
        return "bg-emerald-500";
      case "yellow":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getZoneName = (zone: string) => {
    switch (zone) {
      case "green":
        return "Зеленая зона (86-100%)";
      case "yellow":
        return "Желтая зона (50-85%)";
      case "red":
        return "Красная зона (5-49%)";
      default:
        return "Неизвестно";
    }
  };

  // Функция для определения зоны по рейтингу
  const getRatingZoneByScore = (rating: number): string => {
    if (rating >= 86) return "green";
    if (rating >= 50) return "yellow";
    return "red";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!passportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка</h2>
          <p className="text-slate-600">{error || "Данные не найдены"}</p>
        </div>
      </div>
    );
  }

  const {
    basicInfo,
    qualityKnowledge,
    schoolResults,
    talentDevelopment,
    teacherClassification,
    schoolEquipment,
    internationalRelations,
    security,
  } = passportData;

  // Подготовка данных для графиков
  const qualityData = [
    { year: "Отлично", value: qualityKnowledge.excellent },
    { year: "Хорошо", value: qualityKnowledge.good },
    { year: "Удовл.", value: qualityKnowledge.satisfactory },
  ];

  const talentData = [
    {
      level: "Городской",
      participants: talentDevelopment.cityWinners,
      winners: talentDevelopment.cityWinners,
    },
    {
      level: "Республиканский",
      participants: talentDevelopment.republicWinners,
      winners: talentDevelopment.republicWinners,
    },
    {
      level: "Международный",
      participants: talentDevelopment.internationalWinners,
      winners: talentDevelopment.internationalWinners,
    },
  ];

  const categoryData = [
    {
      name: "Учитель-мастер",
      value: teacherClassification.teacherMaster,
      color: "#22c55e",
    },
    {
      name: "Учитель-исследователь",
      value: teacherClassification.teacherResearcher,
      color: "#3b82f6",
    },
    {
      name: "Учитель-эксперт",
      value: teacherClassification.teacherExpert,
      color: "#eab308",
    },
    {
      name: "Учитель-модератор",
      value: teacherClassification.teacherModerator,
      color: "#f59e0b",
    },
    {
      name: "Учитель",
      value: teacherClassification.teacher,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      {/* <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <School className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Паспорт школы
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Детальная информация об учреждении
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/${resolvedParams.lang}/dashboard`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Главная
                </Button>
              </Link>
              <Link href={`/${resolvedParams.lang}/schools/organizations`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />К списку школ
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20"></div>
                  <Avatar className="relative h-9 w-9 bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)]">
                    <AvatarFallback className="bg-transparent text-slate-700 text-sm font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-700 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm border border-transparent hover:border-red-200/50 rounded-xl transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* School Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/7 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        <div className="relative px-6 py-16">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {basicInfo.nameRu}
                </h1>
                <p className="text-xl text-white/90 mb-4 leading-relaxed">
                  {basicInfo.nameKz}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {basicInfo.district}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {basicInfo.organizationTypes}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Основана в {basicInfo.constructionYear || "н/д"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg mb-4">
                  <span className="text-3xl font-bold text-white">
                    {Math.round(basicInfo.overallRating)}
                  </span>
                </div>
                <div className="text-white/90">
                  <Badge
                    className={`${getRatingZoneColor(
                      getRatingZoneByScore(basicInfo.overallRating)
                    )} text-white border-0 text-sm px-4 py-2`}
                  >
                    {getZoneName(getRatingZoneByScore(basicInfo.overallRating))}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto px-6 py-12 space-y-12">
        {/* Основная информация */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mr-3 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              Основная информация
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-bold text-slate-900">Адрес:</span>
                </div>
                <p className="text-slate-600 ml-12 font-medium leading-relaxed">
                  {basicInfo.address}
                </p>
              </div>

              {basicInfo.phone && (
                <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Phone className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="font-bold text-slate-900">Телефон:</span>
                  </div>
                  <p className="text-slate-600 ml-12 font-medium">
                    {basicInfo.phone}
                  </p>
                </div>
              )}

              <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-bold text-slate-900">Директор:</span>
                </div>
                <p className="text-slate-600 ml-12 font-medium">
                  {basicInfo.director || "Не указано"}
                </p>
              </div>

              <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="font-bold text-slate-900">
                    Год основания:
                  </span>
                </div>
                <p className="text-slate-600 ml-12 font-medium">
                  {basicInfo.constructionYear || "Не указано"}
                </p>
              </div>

              <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-bold text-slate-900">
                    Проектная мощность:
                  </span>
                </div>
                <p className="text-slate-600 ml-12 font-medium">
                  {basicInfo.designCapacity?.toLocaleString() || "Не указано"}{" "}
                  учащихся
                </p>
              </div>

              <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="font-bold text-slate-900">
                    Количество учащихся:
                  </span>
                </div>
                <p className="text-slate-600 ml-12 font-medium mb-3">
                  {basicInfo.currentStudentCount.toLocaleString()} учащихся
                </p>
                <div className="ml-12">
                  <Progress
                    value={
                      basicInfo.designCapacity
                        ? (basicInfo.currentStudentCount /
                            basicInfo.designCapacity) *
                          100
                        : 0
                    }
                    className="h-3 bg-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-semibold">
                    {basicInfo.designCapacity
                      ? Math.round(
                          (basicInfo.currentStudentCount /
                            basicInfo.designCapacity) *
                            100
                        )
                      : 0}
                    % заполненности
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Качество знаний за 3 года */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mr-3 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Качество знаний за 3 года
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
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
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/60">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      {qualityKnowledge.qualityRating}%
                    </span>
                    <div className="p-2 bg-white rounded-lg shadow-md">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-slate-600 font-semibold text-lg">
                    Рейтинг качества знаний
                  </p>
                  <p className="text-sm text-slate-500 mt-3 font-medium bg-white px-4 py-2 rounded-lg">
                    Отлично: {qualityKnowledge.excellent}%, Хорошо:{" "}
                    {qualityKnowledge.good}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Динамика результатов */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-3 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Динамика результатов выпускников
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/60">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {schoolResults.graduatesCount}
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">
                  Выпускники
                </p>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Текущий год
                  </span>
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200/60">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {schoolResults.altynBelgiCount}
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">
                  Алтын белги
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Золотые медали
                  </span>
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/60">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {schoolResults.averageUNTScore || "н/д"}
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">
                  Средний балл ЕНТ
                </p>
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Академический результат
                  </span>
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/60">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {schoolResults.grantReceiversCount}
                </div>
                <p className="text-sm text-slate-600 mb-3 font-semibold">
                  Гранты
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Обладатели грантов
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Развитие талантов и Квалификация педагогов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Развитие талантов */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mr-3 flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                Развитие талантов
              </h2>
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={talentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="participants"
                      fill="#3b82f6"
                      name="Участники"
                    />
                    <Bar dataKey="winners" fill="#22c55e" name="Победители" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Квалификация педагогов */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                Педагогический состав
              </h2>

              {/* Общая информация */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-800">
                      Всего педагогов: {teacherClassification.total}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Распределение по квалификационным уровням
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {teacherClassification.total}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} педагогов`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Детализация по уровням */}
                {/* <div className="space-y-3">
                  <p className="font-medium text-slate-800">
                    Квалификационные уровни педагогов:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryData.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium text-slate-700">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-slate-800">
                            {category.value}
                          </span>
                          <span className="text-xs text-slate-500">
                            (
                            {Math.round(
                              (category.value / teacherClassification.total) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Оснащенность школы */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              Оснащенность школы
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/60">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {schoolEquipment.totalClassrooms}
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Всего кабинетов
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200/60">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {schoolEquipment.newModificationClassrooms}
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Новых/модернизированных
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200/60">
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {Math.round(schoolEquipment.equipmentRating)}%
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Рейтинг оснащенности
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-800 font-medium">
                  Процент оснащенности кабинетов
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {Math.round(
                    (schoolEquipment.newModificationClassrooms /
                      schoolEquipment.totalClassrooms) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (schoolEquipment.newModificationClassrooms /
                    schoolEquipment.totalClassrooms) *
                  100
                }
                className="h-3 bg-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mr-3 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Безопасность
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      security.videoSurveillanceSystem
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <Camera
                      className={`h-5 w-5 ${
                        security.videoSurveillanceSystem
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Видеонаблюдение
                  </span>
                </div>
                <div className="flex items-center">
                  {security.videoSurveillanceSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      security.turnstileSystem ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Users
                      className={`h-5 w-5 ${
                        security.turnstileSystem
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Турникеты
                  </span>
                </div>
                <div className="flex items-center">
                  {security.turnstileSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      security.warningSystem ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        security.warningSystem
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Система оповещения
                  </span>
                </div>
                <div className="flex items-center">
                  {security.warningSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    Рейтинг безопасности
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    На основе систем безопасности
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-red-600">
                    {Math.round(security.securityRating)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Международные отношения */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
          <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
          <div className="relative p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mr-3 flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              Международные отношения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/60">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {internationalRelations.studentParticipation}
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Участие учащихся в международных программах
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200/60">
                <div className="text-3xl font-bold text-teal-600 mb-2">
                  {internationalRelations.teacherParticipation}
                </div>
                <p className="text-sm text-slate-600 font-semibold">
                  Участие педагогов в международных программах
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    Рейтинг международных отношений
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Участие в международных программах и проектах
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(internationalRelations.internationalRating)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Экспорт */}
        <div className="flex justify-center">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6">
              <Button
                onClick={() => {
                  console.log("Экспорт паспорта школы:", basicInfo.id);
                  alert("Экспорт паспорта школы выполнен успешно!");
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 text-lg font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Экспорт паспорта в PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(SchoolPassportPage);
