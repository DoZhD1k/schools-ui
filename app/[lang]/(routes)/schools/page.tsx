"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion, AnimatePresence, Variants } from 'framer-motion'
import SchoolDetailPopup from "@/components/schools/school-detail-popup";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  School,
  Trophy,
  Users,
  Star,
  BarChart3,
  MapPin,
  LogOut,
  Search,
  Eye,
  Download,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Grid3X3,
  List,
  Award,
  ChevronLeft, 
  ChevronRight, 
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";

import {
  District,
  DistrictStats,
  SchoolFilters,
} from "@/types/schools";

const chartConfig = {
  desktop: {
    label: "Count",
    color: "var(--chart-2)",
  },
  high: {
    label: "High",
    color: "var(--chart-2)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

interface SchoolsPageProps {
  params: { lang: string };
}

interface DistrictData {
  district: string
  count: number
  high: number
  medium: number
  low: number
}

interface RatingApiItem {
  district: string
  count: number
  rating?: {
    high: number
    medium: number
    low: number
  }
}

interface SchoolApiItem {
  id: number;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  district: string;
  gis_rating: number | null;
}

interface AnalyzeItem {
  id: number;
  academic_results_rating: number;
  pedagogical_potential_rating: number;
  safety_climate_rating: number;
  infrastructure_rating: number;
  graduate_success_rating: number;
  penalty_rating: number;
  digital_rating: number;
}

export type CombinedSchool = SchoolApiItem & Partial<Omit<AnalyzeItem, 'id'>>;

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

// Типы данных
interface SchoolData {
  id: string;
  nameRu: string;
  organizationType: string;
  district: string;
  address: string;
  phone?: string;
  director: string;
  currentRating: number;
  q1Rating: number;
  q2Rating: number;
  q3Rating: number;
  yearlyRating: number;
  ratingZone: "green" | "yellow" | "red";
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: "up" | "down";
  trendValue?: string;
}

// Статистические карточки
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  trendValue,
}: StatCardProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-200/50";
      case "warning":
        return "from-amber-500/20 to-orange-600/20 border-amber-200/50";
      case "danger":
        return "from-red-500/20 to-rose-600/20 border-red-200/50";
      default:
        return "from-blue-500/20 to-indigo-600/20 border-blue-200/50";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getVariantClass()} backdrop-blur-md rounded-3xl`}
      ></div>
      <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
      <div className="relative p-6 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Компонент карточки школы
const SchoolCard = ({
  school,
  onView,
}: {
  school: CombinedSchool;
  onView: (school: CombinedSchool) => void;
}) => {
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
        return "Зеленая зона";
      case "yellow":
        return "Желтая зона";
      case "red":
        return "Красная зона";
      default:
        return "Неизвестно";
    }
  };

  const formatTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.5)
      return <Minus className="h-4 w-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getColoredRating = (rating: number | null) => {
    if (rating === null || rating === undefined) return '—';
    if (rating >= 4.3) return <span className="bg-green-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
    if (rating >= 3.0) return <span className="bg-yellow-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
    return <span className="bg-red-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
  }

  const getPercentage = (value?: number) => {
    if (value === undefined || value === null) 
      return (
      <span className={`px-2 py-1 text-gray-600`}>
        -
      </span>
    );
    
    // let colorClass = ''; // default: low
    // if (value >= 80) colorClass = 'bg-green-400';      // excellent
    // else if (value >= 50) colorClass = 'bg-yellow-400'; // medium

    return (
      <span className={` font-semibold px-2 py-1 rounded-md`}>
        {value.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {school.name_of_the_organization}
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              {school.types_of_educational_institutions}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">{school.district}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              {/* <div
                className={`w-12 h-12 rounded-2xl ${getRatingZoneColor(
                  school.ratingZone
                )} flex items-center justify-center shadow-lg`}
              > */}
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">
                  {school.digital_rating ?? "—"}
                </span>
              </div>
              {/* {formatTrend(school.currentRating, school.q3Rating)} */}
              {getColoredRating(school.gis_rating ?? null)}
            </div>
            {/* <Badge
              className={`text-xs font-medium ${getRatingZoneColor(
                school.ratingZone
              )} text-white border-0`}
            > */}
            <Badge
              className={`text-xs font-medium text-white border-0`}
            >
              {/* {getZoneName(school.ratingZone)} */}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-blue-600">
              {getPercentage(school.academic_results_rating)}
            </div>
            <div className="text-xs text-slate-500">1-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-emerald-600">
              {getPercentage(school.pedagogical_potential_rating)}
            </div>
            <div className="text-xs text-slate-500">2-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-purple-600">
              {getPercentage(school.safety_climate_rating)}
            </div>
            <div className="text-xs text-slate-500">3-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-amber-600">
              {getPercentage(school.graduate_success_rating)}
            </div>
            <div className="text-xs text-slate-500">Годовой</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{getColoredRating(school.gis_rating)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(school)}
            className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Паспорт
          </Button>
        </div>
      </div>
    </div>
  );
};

// Компонент таблицы школ
const SchoolsTable = ({
  onRowClick,
  selectedDistrict,
  searchQuery,
  onView,
  schools,
  setSchools
}: {
  onRowClick: (school: CombinedSchool) => void;
  selectedDistrict?: string;
  searchQuery?: string;
  onView: (school: CombinedSchool) => void;
  schools: CombinedSchool[];
  setSchools: React.Dispatch<React.SetStateAction<CombinedSchool[]>>;
}) => {
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; 
  // const getRatingZoneColor = (zone: string) => {
  //   switch (zone) {
  //     case "green":
  //       return "bg-emerald-500";
  //     case "yellow":
  //       return "bg-amber-500";
  //     case "red":
  //       return "bg-red-500";
  //     default:
  //       return "bg-gray-500";
  //   }
  // };

  // const getZoneName = (zone: string) => {
  //   switch (zone) {
  //     case "green":
  //       return "Зеленая зона";
  //     case "yellow":
  //       return "Желтая зона";
  //     case "red":
  //       return "Красная зона";
  //     default:
  //       return "Неизвестно";
  //   }
  // };

  // const formatTrend = (current: number, previous: number) => {
  //   const diff = current - previous;
  //   if (Math.abs(diff) < 0.5)
  //     return <Minus className="h-4 w-4 text-gray-400" />;
  //   if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
  //   return <TrendingDown className="h-4 w-4 text-red-500" />;
  // };


  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const getColoredPercentage = (value?: number) => {
    if (value === undefined || value === null) 
      return (
      <span className={`px-2 py-1 text-gray-600`}>
        -
      </span>
    );;
    
    let colorClass = 'bg-red-400'; // default: low
    if (value >= 80) colorClass = 'bg-green-400';      // excellent
    else if (value >= 50) colorClass = 'bg-yellow-400'; // medium

    return (
      <span className={`${colorClass} font-semibold px-2 py-1 rounded-md`}>
        {value.toFixed(1)}%
      </span>
    );
  };

  const getColoredRating = (rating: number | null) => {
    if (rating === null || rating === undefined) return '—';
    if (rating >= 4.3) return <span className="bg-green-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
    if (rating >= 3.0) return <span className="bg-yellow-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
    return <span className="bg-red-400 font-semibold px-2 py-1 rounded-md">{rating}</span>;
  }

  useEffect(() => {
    const districtFilter = !selectedDistrict || selectedDistrict === "all" ? "" : selectedDistrict
    // const ratingFilter = !selectedRating || selectedRating === "all" ? "" : selectedRating.toLowerCase();
    const fetchData = async () => {
      try {
        const offset = (currentPage - 1) * itemsPerPage;

        const [res1, res2] = await Promise.all([
          fetch(
            `https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools/?limit=${itemsPerPage}&offset=${offset}&district=${districtFilter}&search=${searchQuery}`
          ),
          fetch(
            `https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools/analyze/?limit=${itemsPerPage}&offset=${offset}&district=${districtFilter}`
          ),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const analyzeMap = new Map<number, AnalyzeItem>();
        data2.results.forEach((a: AnalyzeItem) => analyzeMap.set(a.id, a));

        const merged: CombinedSchool[] = data1.results.map((s: SchoolApiItem) => ({
          ...s,
          ...(analyzeMap.get(s.id) ?? {}),
        }));

        setSchools(merged);
        setTotalCount(data1.count);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    fetchData();
  }, [currentPage, selectedDistrict, searchQuery]);

  return (
    <div>
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative overflow-x-auto overflow-y-auto max-h-[600px] ">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b border-slate-200/50">
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Наименование
              </th>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Район
              </th>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Общий рейтинг
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Качество знаний
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Квалификация педагогов
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Безопасность
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Оснащенность
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Динамика результатов школы
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Профилактика нарушений
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Рейтинг GIS
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Паспорт организации
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school, index) => (
              <tr
                key={school.id}
                className={`border-b border-slate-200/30 hover:bg-slate-50/50 transition-colors ${
                  index % 2 === 0 ? "bg-slate-25/30" : ""
                }`}
                onClick={() => onRowClick(school)}
              >
                <td className="p-6">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">
                      {school.name_of_the_organization}
                    </div>
                    <div className="text-sm text-slate-600">
                      {school.types_of_educational_institutions}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      {school.district}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    {school.district}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-sm text-white">
                    {getColoredPercentage(school.digital_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-blue-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredPercentage(school.academic_results_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-emerald-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredPercentage(school.pedagogical_potential_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-purple-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredPercentage(school.safety_climate_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-amber-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredPercentage(school.infrastructure_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-amber-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredPercentage(school.graduate_success_rating)}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-sm text-white">
                    {getColoredPercentage(school.penalty_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-8 bg-emerald-50 text-white rounded-lg font-semibold text-sm">
                    {getColoredRating(school.gis_rating)}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(school)}
                    className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Паспорт
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-b-0 border-slate-200 rounded-b-lg">
        <div className="flex items-center text-sm text-slate-700">
          Показано {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, totalCount)} из {totalCount} школ
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  page === currentPage ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function SchoolsPage({ params }: SchoolsPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Пользователь");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [data, setData] = useState<DistrictData[]>([])
  const [schools, setSchools] = useState<CombinedSchool[]>([]);
  // Данные (в реальном приложении будут загружаться с сервера)
  // const [schools] = useState<SchoolData[]>([
  //   {
  //     id: "1",
  //     nameRu: "Школа-лицей №165 имени Гани Муратбаева",
  //     organizationType: "Государственное учреждение",
  //     district: "Алмалинский район",
  //     address: "ул. Толе би, 273/1",
  //     phone: "+7 (727) 292-15-46",
  //     director: "Ахметова Айгуль Кайратовна",
  //     currentRating: 85,
  //     q1Rating: 82,
  //     q2Rating: 84,
  //     q3Rating: 83,
  //     yearlyRating: 85,
  //     ratingZone: "green",
  //   },
  //   {
  //     id: "2",
  //     nameRu: "Гимназия №148",
  //     organizationType: "Государственное учреждение",
  //     district: "Бостандыкский район",
  //     address: "ул. Сейфуллина, 458",
  //     phone: "+7 (727) 267-89-23",
  //     director: "Нурланов Ерлан Маратович",
  //     currentRating: 78,
  //     q1Rating: 75,
  //     q2Rating: 77,
  //     q3Rating: 76,
  //     yearlyRating: 78,
  //     ratingZone: "yellow",
  //   },
  //   {
  //     id: "3",
  //     nameRu: "Средняя школа №89",
  //     organizationType: "Государственное учреждение",
  //     district: "Турксибский район",
  //     address: "ул. Рыскулова, 123",
  //     phone: "+7 (727) 396-45-12",
  //     director: "Сарсенова Гульнара Амангельдиновна",
  //     currentRating: 65,
  //     q1Rating: 63,
  //     q2Rating: 64,
  //     q3Rating: 66,
  //     yearlyRating: 65,
  //     ratingZone: "red",
  //   },
  //   {
  //     id: "4",
  //     nameRu: "НИШ ФМН г. Алматы",
  //     organizationType: "Автономная организация образования",
  //     district: "Алатауский район",
  //     address: "ул. Шевченко, 189",
  //     phone: "+7 (727) 273-56-78",
  //     director: "Калиев Данияр Ермекович",
  //     currentRating: 92,
  //     q1Rating: 90,
  //     q2Rating: 91,
  //     q3Rating: 89,
  //     yearlyRating: 92,
  //     ratingZone: "green",
  //   },
  //   {
  //     id: "5",
  //     nameRu: "Лицей №28",
  //     organizationType: "Государственное учреждение",
  //     district: "Медеуский район",
  //     address: "мкр. Самал-1, д. 15",
  //     phone: "+7 (727) 264-78-90",
  //     director: "Жанузакова Асель Болатовна",
  //     currentRating: 81,
  //     q1Rating: 79,
  //     q2Rating: 80,
  //     q3Rating: 82,
  //     yearlyRating: 81,
  //     ratingZone: "green",
  //   },
  //   {
  //     id: "6",
  //     nameRu: "Средняя школа №156",
  //     organizationType: "Государственное учреждение",
  //     district: "Жетысуский район",
  //     address: "ул. Абая, 567",
  //     phone: "+7 (727) 398-23-45",
  //     director: "Темирбеков Нурлан Сериккалиевич",
  //     currentRating: 72,
  //     q1Rating: 70,
  //     q2Rating: 71,
  //     q3Rating: 74,
  //     yearlyRating: 72,
  //     ratingZone: "yellow",
  //   },
  // ]);

  const districts = [
    // { id: "all", name: "Все районы" },
    { id: "alatausky", name: "Алатауский район" },
    { id: "almalinsky", name: "Алмалинский район" },
    { id: "zhetysusky", name: "Ауэзовский район" },
    { id: "bostandyksky", name: "Бостандыкский район" },
    { id: "zhetysusky", name: "Жетысуский район" },
    { id: "medeusky", name: "Медеуский район" },
    { id: "zhetysusky", name: "Наурызбайский район" },
    { id: "turksibsky", name: "Турксибский район" },
  ];

  // const stats = {
  //   totalSchools: schools.length,
  //   greenZone: schools.filter((s) => s.ratingZone === "green").length,
  //   yellowZone: schools.filter((s) => s.ratingZone === "yellow").length,
  //   redZone: schools.filter((s) => s.ratingZone === "red").length,
  //   averageRating: Math.round(
  //     schools.reduce((sum, s) => sum + s.currentRating, 0) / schools.length
  //   ),
  // };

  const stats = {
    totalSchools: schools.length,
    greenZone: schools.length,
    yellowZone: schools.length,
    redZone: schools.length,
    averageRating: Math.round(
      schools.reduce((sum, s) => sum + (s.digital_rating ?? 0), 0) / schools.length
    ),
  };

  const getRatingInfo = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) {
      return { color: "text-slate-400", bgColor: "bg-slate-100", icon: Target };
    }

    if (rating >= 80) {
      return { color: "text-emerald-600", bgColor: "bg-emerald-50", icon: Trophy }; // High
    } else if (rating < 50) {
      return { color: "text-red-500", bgColor: "bg-red-50", icon: Target }; // Low
    } else {
      return { color: "text-amber-600", bgColor: "bg-amber-50", icon: Star }; // Medium
    }
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools/rating-by-district/")
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`)
        }
        const result = await response.json()

        const formatted = result.map((item: RatingApiItem) => ({
            district: item.district,
            count: item.count,
            high: item.rating?.high ?? 0,
            medium: item.rating?.medium ?? 0,
            low: item.rating?.low ?? 0,
        }))

        setData(formatted)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message)
        } else {
          console.error("Unexpected error", err)
        }
      }
    }
    fetchData()
  }, [])

  const [selectedSchool, setSelectedSchool] = useState<CombinedSchool | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (school: CombinedSchool) => {
    setSelectedSchool(school);
    setShowModal(true);
  };


  const exportAllToExcel = async () => {
    try {
      const allSchools: CombinedSchool[] = [];
      const itemsPerPage = 100;
      let offset = 0;

      while (true) {
        const [res1, res2] = await Promise.all([
          fetch(`https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools/?limit=${itemsPerPage}&offset=${offset}`),
          fetch(`https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools/analyze/?limit=${itemsPerPage}&offset=${offset}`)
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const analyzeMap = new Map<number, AnalyzeItem>();
        data2.results.forEach((a: AnalyzeItem) => analyzeMap.set(a.id, a));

        const merged = data1.results.map((s: SchoolApiItem) => ({
          ...s,
          ...(analyzeMap.get(s.id) ?? {})
        }));

        allSchools.push(...merged);

        offset += itemsPerPage;
        if (offset >= data1.count) break;
      }

      const rows = allSchools.map((s) => ({
        Наименование: s.name_of_the_organization,
        Район: s.district,
        'Рейтинг GIS': s.gis_rating ?? '',
        'Качество знаний': s.academic_results_rating ?? '',
        'Квалификация педагогов': s.pedagogical_potential_rating ?? '',
        Безопасность: s.safety_climate_rating ?? '',
        Оснащенность: s.infrastructure_rating ?? '',
        'Динамика результатов школы': s.graduate_success_rating ?? '',
        Профилактика: s.penalty_rating ?? '',
        'Общий рейтинг': s.digital_rating ?? '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Schools');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `schools_full.xlsx`);
    } catch (err) {
      console.error('Ошибка экспорта:', err);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name_of_the_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.types_of_educational_institutions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict =
      selectedDistrict === "all" ||
      school.district.toLowerCase().includes(selectedDistrict);
    return matchesSearch && (selectedDistrict === "all" || matchesDistrict);
  });

  const handleViewSchool = (school: CombinedSchool) => {
    // Переход на паспорт школы
    window.location.href = `/${params.lang}/schools/passport/${school.id}`;
  };

  const handleExport = () => {
    console.log("Экспорт данных:", filteredSchools);
    alert("Экспорт выполнен успешно!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

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
                  Рейтинг школ
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Образовательные учреждения Алматы
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
              <Link href={`/${params.lang}/map`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Карта
                </Button>
              </Link>
              <Link href={`/${params.lang}/schools/forecast`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Прогноз дефицита
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

      {/* Welcome Banner */}
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
            <div className="flex items-center justify-between">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Цифровой рейтинг школ
                </h1>
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  Комплексная система оценки образовательных учреждений на
                  основе объективных показателей качества образования.
                </p>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.6)]"></div>
                    <span className="text-sm font-medium">
                      Актуальные данные
                    </span>
                  </div>
                  <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                    Обновлено: {new Date().toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-80 h-80 relative">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-lg"></div>
                  <div className="absolute inset-4 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] shadow-md"></div>
                  <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.05)] flex items-center justify-center shadow-sm">
                    {/* <Shield className="h-16 w-16 text-white/90" /> */}
                    <Image
                      src="/images/cup.png"
                      alt="Cup"
                      width={300}
                      height={300}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard
            title="Всего школ"
            value={stats.totalSchools}
            subtitle="Образовательных учреждений"
            icon={<School className="h-6 w-6" />}
            variant="default"
          />

          <StatCard
            title="Зеленая зона"
            value={stats.greenZone}
            subtitle="Высокий рейтинг"
            icon={<Trophy className="h-6 w-6" />}
            variant="success"
            trend="up"
            trendValue="+12%"
          />

          <StatCard
            title="Желтая зона"
            value={stats.yellowZone}
            subtitle="Средний рейтинг"
            icon={<Users className="h-6 w-6" />}
            variant="warning"
          />

          <StatCard
            title="Красная зона"
            value={stats.redZone}
            subtitle="Требует внимания"
            icon={<TrendingDown className="h-6 w-6" />}
            variant="danger"
          />

          <StatCard
            title="Средний рейтинг"
            value={stats.averageRating}
            subtitle="По всем школам"
            icon={<Star className="h-6 w-6" />}
            variant="default"
            trend="up"
            trendValue="+3.2"
          />
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="p-6">
            <Card className="bg-white/80 shadow-none border-0">
              <CardHeader className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg font-bold text-slate-800">Количество школ по районам</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={data}
                    layout="vertical"
                    margin={{
                      right: 16,
                    }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="district"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <XAxis dataKey="count" type="number" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                      dataKey="count"
                      layout="vertical"
                      fill="var(--color-desktop)"
                      radius={4}
                    >
                      <LabelList
                        dataKey="district"
                        position="insideLeft"
                        offset={8}
                        className="fill-(--color-label)"
                        fontSize={12}
                      />
                      <LabelList
                        dataKey="count"
                        position="right"
                        offset={8}
                        className="gray"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="p-6">
            <Card className="bg-white/80 shadow-none border-0">
              <CardHeader className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg font-bold text-slate-800">Рейтинг школ по районам</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="district"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend className="text-black" content={<ChartLegendContent />} />
                    <Bar
                      dataKey="high"
                      stackId="a"
                      // fill="var(--color-desktop)"
                      fill="#41e14eff"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="medium"
                      stackId="a"
                      fill="#e4e591ff"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="low"
                      stackId="a"
                      fill="#de664eff"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600 z-10" />
                    <Input
                      placeholder="Поиск по названию школы, району или директору..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80 text-slate-700"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-xl border border-[hsl(0_0%_100%_/_0.2)] p-1">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className={`h-8 px-3 ${
                        viewMode === "table"
                          ? "bg-white shadow-sm text-slate-700"
                          : "text-slate-600 hover:text-slate-700"
                      }`}
                    >
                      <List className="h-4 w-4 mr-1" />
                      Таблица
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                      className={`h-8 px-3 ${
                        viewMode === "cards"
                          ? "bg-white shadow-sm text-slate-700"
                          : "text-slate-600 hover:text-slate-700"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4 mr-1" />
                      Карточки
                    </Button>
                  </div>
                  <Select
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                  >
                    <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <SelectValue placeholder="Все районы" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все районы</SelectItem>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.name}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={exportAllToExcel}
                    className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schools Content */}
        {viewMode === "table" ? (
          <SchoolsTable onRowClick={handleRowClick} selectedDistrict={selectedDistrict} searchQuery={searchTerm} onView={handleViewSchool} schools={schools} setSchools={setSchools} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                onView={handleViewSchool}
              />
            ))}
          </div>
        )}
        <AnimatePresence>
          <SchoolDetailPopup
            isOpen={showModal}
            school={selectedSchool}
            onClose={() => setShowModal(false)}
            getRatingInfo={getRatingInfo}
          />
        </AnimatePresence>

        {schools.length === 0 && (
          <div className="relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-12 text-center">
              <School className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Школы не найдены
              </h3>
              <p className="text-slate-600 mb-6">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDistrict("all");
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(SchoolsPage);
