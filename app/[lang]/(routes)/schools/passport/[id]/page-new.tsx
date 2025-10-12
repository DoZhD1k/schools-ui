"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  School,
  Building2,
  MapPin,
  Phone,
  User,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  BarChart3,
  ArrowLeft,
  LogOut,
  Download,
  Shield,
  Camera,
  AlertTriangle,
  Accessibility,
  GraduationCap,
  UserCheck,
  Briefcase,
  Globe,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  SchoolPassportService,
  SchoolPassportData,
} from "@/services/school-passport.service";

interface SchoolPassportPageProps {
  params: {
    id: string;
    lang: string;
  };
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

function SchoolPassportPage({ params }: SchoolPassportPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Пользователь");
  const [passportData, setPassportData] = useState<SchoolPassportData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolPassport = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const passport = await SchoolPassportService.getSchoolPassport(
          params.id
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
  }, [params.id]);

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

  const getRatingZoneColor = (rating: number) => {
    if (rating >= 86) return "bg-emerald-500";
    if (rating >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getZoneName = (rating: number) => {
    if (rating >= 86) return "Зеленая зона (86-100%)";
    if (rating >= 50) return "Желтая зона (50-85%)";
    return "Красная зона (5-49%)";
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

  const { basicInfo } = passportData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
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
              <Link href={`/${params.lang}/dashboard`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Главная
                </Button>
              </Link>
              <Link href={`/${params.lang}/schools/rating`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />К рейтингу школ
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
      </header>

      {/* School Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-slate-700/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        <div className="relative px-6 py-16">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {basicInfo.nameRu}
                </h1>
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
                  {basicInfo.constructionYear && (
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Основана в {basicInfo.constructionYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg mb-4">
                  <span className="text-3xl font-bold text-white">
                    {basicInfo.overallRating}
                  </span>
                </div>
                <div className="text-white/90">
                  <Badge
                    className={`${getRatingZoneColor(
                      basicInfo.overallRating
                    )} text-white border-0 text-sm px-4 py-2`}
                  >
                    {getZoneName(basicInfo.overallRating)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto px-6 py-12 space-y-12">
        {/* 1. Основная информация */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              1. Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoCard
                icon={MapPin}
                iconColor="blue"
                title="Адрес"
                value={basicInfo.address}
              />
              {basicInfo.phone && (
                <InfoCard
                  icon={Phone}
                  iconColor="emerald"
                  title="Телефон"
                  value={basicInfo.phone}
                />
              )}
              {basicInfo.director && (
                <InfoCard
                  icon={User}
                  iconColor="purple"
                  title="Директор"
                  value={basicInfo.director}
                />
              )}
              {basicInfo.constructionYear && (
                <InfoCard
                  icon={Calendar}
                  iconColor="amber"
                  title="Год постройки"
                  value={basicInfo.constructionYear.toString()}
                />
              )}
              {basicInfo.commissioningYear && (
                <InfoCard
                  icon={Calendar}
                  iconColor="green"
                  title="Год ввода в эксплуатацию"
                  value={basicInfo.commissioningYear.toString()}
                />
              )}
              {basicInfo.designCapacity && (
                <InfoCard
                  icon={Users}
                  iconColor="green"
                  title="Проектная мощность"
                  value={`${basicInfo.designCapacity.toLocaleString()} мест`}
                />
              )}
              <InfoCard
                icon={Users}
                iconColor="rose"
                title="Количество учеников"
                value={`${basicInfo.currentStudentCount.toLocaleString()} чел.`}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Качество знаний */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              2. Качество знаний
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Отлично (5)"
                    value={passportData.qualityKnowledge.excellent}
                    color="emerald"
                  />
                  <StatCard
                    title="Хорошо (4)"
                    value={passportData.qualityKnowledge.good}
                    color="blue"
                  />
                  <StatCard
                    title="Удовлетворительно (3)"
                    value={passportData.qualityKnowledge.satisfactory}
                    color="amber"
                  />
                  <StatCard
                    title="Не предоставляется"
                    value={passportData.qualityKnowledge.notProvided}
                    color="slate"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {passportData.qualityKnowledge.qualityRating}%
                  </div>
                  <p className="text-slate-600 font-semibold">
                    Рейтинг качества знаний
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Динамика результатов школы */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              3. Динамика результатов школы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Выпускники"
                value={passportData.schoolResults.graduatesCount}
                color="blue"
              />
              <StatCard
                title="Алтын белгі"
                value={passportData.schoolResults.altynBelgiCount}
                color="yellow"
              />
              <StatCard
                title="Поступили на грант"
                value={passportData.schoolResults.grantReceiversCount}
                color="green"
              />
              <StatCard
                title="Рейтинг результатов"
                value={`${passportData.schoolResults.resultsRating}%`}
                color="purple"
              />
            </div>
          </CardContent>
        </Card>

        {/* Остальные разделы будут добавлены аналогично */}
        {/* 4. Развитие талантов */}
        <PassportSection
          number={4}
          title="Развитие талантов"
          icon={Award}
          iconColor="from-yellow-500 to-orange-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Городские победители"
              value={passportData.talentDevelopment.cityWinners}
              color="blue"
            />
            <StatCard
              title="Республиканские победители"
              value={passportData.talentDevelopment.republicWinners}
              color="green"
            />
            <StatCard
              title="Международные победители"
              value={passportData.talentDevelopment.internationalWinners}
              color="purple"
            />
            <StatCard
              title="Рейтинг талантов"
              value={`${passportData.talentDevelopment.talentRating}%`}
              color="amber"
            />
          </div>
        </PassportSection>

        {/* 5. Классификация педагогов */}
        <PassportSection
          number={5}
          title="Классификация педагогов"
          icon={UserCheck}
          iconColor="from-blue-500 to-indigo-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <StatCard
                title="Всего педагогов"
                value={passportData.teacherClassification.total}
                color="slate"
              />
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Педагог-мастер"
                  value={passportData.teacherClassification.teacherMaster}
                  color="emerald"
                />
                <StatCard
                  title="Педагог-исследователь"
                  value={passportData.teacherClassification.teacherResearcher}
                  color="blue"
                />
                <StatCard
                  title="Педагог-эксперт"
                  value={passportData.teacherClassification.teacherExpert}
                  color="purple"
                />
                <StatCard
                  title="Педагог-модератор"
                  value={passportData.teacherClassification.teacherModerator}
                  color="amber"
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {passportData.teacherClassification.classificationRating}%
                </div>
                <p className="text-slate-600 font-semibold">
                  Рейтинг квалификации
                </p>
              </div>
            </div>
          </div>
        </PassportSection>

        {/* 9. Безопасность */}
        <PassportSection
          number={9}
          title="Безопасность"
          icon={Shield}
          iconColor="from-red-500 to-pink-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityFeature
              title="Видеонаблюдение"
              available={passportData.security.videoSurveillanceSystem}
              icon={Camera}
            />
            <SecurityFeature
              title="Турникеты"
              available={passportData.security.turnstileSystem}
              icon={Shield}
            />
            <SecurityFeature
              title="Система оповещения"
              available={passportData.security.warningSystem}
              icon={AlertTriangle}
            />
            <StatCard
              title="Рейтинг безопасности"
              value={`${passportData.security.securityRating}%`}
              color="red"
            />
          </div>
        </PassportSection>

        {/* Экспорт */}
        <div className="flex justify-center">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Вспомогательные компоненты
interface InfoCardProps {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  value: string;
}

function InfoCard({ icon: Icon, iconColor, title, value }: InfoCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="space-y-3 p-6 bg-slate-50/60 rounded-xl border border-slate-200/60">
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg ${
            colorClasses[iconColor as keyof typeof colorClasses]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-bold text-slate-900">{title}:</span>
      </div>
      <p className="text-slate-600 ml-12 font-medium leading-relaxed">
        {value}
      </p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
}

function StatCard({ title, value, color }: StatCardProps) {
  const colorClasses = {
    emerald:
      "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/60 text-emerald-600",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/60 text-blue-600",
    amber:
      "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 text-amber-600",
    slate:
      "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/60 text-slate-600",
    purple:
      "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/60 text-purple-600",
    yellow:
      "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/60 text-yellow-600",
    green:
      "bg-gradient-to-br from-green-50 to-green-100 border-green-200/60 text-green-600",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200/60 text-red-600",
  };

  return (
    <div
      className={`text-center p-6 rounded-xl border ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p className="text-sm text-slate-600 font-medium">{title}</p>
    </div>
  );
}

interface PassportSectionProps {
  number: number;
  title: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  children: React.ReactNode;
}

function PassportSection({
  number,
  title,
  icon: Icon,
  iconColor,
  children,
}: PassportSectionProps) {
  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
          <div
            className={`w-8 h-8 bg-gradient-to-r ${iconColor} rounded-xl flex items-center justify-center`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          {number}. {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface SecurityFeatureProps {
  title: string;
  available: boolean;
  icon: React.ComponentType<any>;
}

function SecurityFeature({
  title,
  available,
  icon: Icon,
}: SecurityFeatureProps) {
  return (
    <div
      className={`text-center p-6 rounded-xl border ${
        available
          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200/60"
          : "bg-gradient-to-br from-red-50 to-red-100 border-red-200/60"
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
          available ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p
        className={`text-xs font-bold ${
          available ? "text-green-600" : "text-red-600"
        }`}
      >
        {available ? "Установлено" : "Отсутствует"}
      </p>
    </div>
  );
}

export default withAuth(SchoolPassportPage);
