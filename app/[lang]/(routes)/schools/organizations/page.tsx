"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  School,
  Building2,
  Users,
  MapPin,
  LogOut,
  Search,
  Eye,
  Download,
  User,
  Phone,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trophy,
  TrendingDown,
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

interface OrganizationsPageProps {
  params: { lang: string };
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

// Типы данных
interface OrganizationData {
  id: string;
  nameRu: string;
  nameKz: string;
  organizationType: string;
  district: string;
  address: string;
  phone?: string;
  director: string;
  currentRating: number;
  currentStudents: number;
  capacity: number;
  ratingZone: "green" | "yellow" | "red";
  website?: string;
  email?: string;
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

// Компонент карточки организации
const OrganizationCard = ({
  organization,
  onView,
}: {
  organization: OrganizationData;
  onView: (org: OrganizationData) => void;
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

  const getCapacityPercentage = () => {
    return Math.round(
      (organization.currentStudents / organization.capacity) * 100
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
              {organization.nameRu}
            </h3>
            <p className="text-sm text-slate-600 mb-1">{organization.nameKz}</p>
            <p className="text-xs text-slate-500 mb-2">
              {organization.organizationType}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {organization.district}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {organization.address}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-12 h-12 rounded-2xl ${getRatingZoneColor(
                  organization.ratingZone
                )} flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">
                  {organization.currentRating}
                </span>
              </div>
            </div>
            <Badge
              className={`text-xs font-medium ${getRatingZoneColor(
                organization.ratingZone
              )} text-white border-0`}
            >
              {getZoneName(organization.ratingZone)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-blue-600">
              {organization.currentStudents.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Учащиеся</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-emerald-600">
              {organization.capacity.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Вместимость</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Заполненность</span>
            <span className="text-slate-800 font-medium">
              {getCapacityPercentage()}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                getCapacityPercentage() > 90
                  ? "bg-red-500"
                  : getCapacityPercentage() > 75
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              data-width={`${Math.min(getCapacityPercentage(), 100)}%`}
              style={{ width: `${Math.min(getCapacityPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <User className="h-4 w-4" />
            <span>{organization.director}</span>
          </div>
          {organization.phone && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              <span>{organization.phone}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(organization)}
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

// Компонент таблицы организаций
const OrganizationsTable = ({
  organizations,
  onView,
  onSort,
  sortBy,
  sortOrder,
}: {
  organizations: OrganizationData[];
  onView: (org: OrganizationData) => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
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

  const SortHeader = ({
    column,
    children,
  }: {
    column: string;
    children: React.ReactNode;
  }) => (
    <th
      className="text-left p-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50/50 transition-colors"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <div className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</div>
        )}
      </div>
    </th>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/50">
              <SortHeader column="nameRu">Организация</SortHeader>
              <SortHeader column="district">Район</SortHeader>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Контакты
              </th>
              <SortHeader column="currentRating">Рейтинг</SortHeader>
              <SortHeader column="currentStudents">Учащиеся</SortHeader>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Заполненность
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org, index) => (
              <tr
                key={org.id}
                className={`border-b border-slate-200/30 hover:bg-slate-50/50 transition-colors ${
                  index % 2 === 0 ? "bg-slate-25/30" : ""
                }`}
              >
                <td className="p-6">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">
                      {org.nameRu}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      {org.nameKz}
                    </div>
                    <div className="text-xs text-slate-500">
                      {org.organizationType}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      {org.address}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    {org.district}
                  </div>
                </td>
                <td className="p-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-slate-600">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate max-w-xs">{org.director}</span>
                    </div>
                    {org.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        {org.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-10 h-10 rounded-xl ${getRatingZoneColor(
                        org.ratingZone
                      )} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white font-bold text-sm">
                        {org.currentRating}
                      </span>
                    </div>
                    <Badge
                      className={`text-xs font-medium ${getRatingZoneColor(
                        org.ratingZone
                      )} text-white border-0`}
                    >
                      {getZoneName(org.ratingZone)}
                    </Badge>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="text-center">
                    <div className="font-semibold text-slate-800">
                      {org.currentStudents.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      из {org.capacity.toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {Math.round((org.currentStudents / org.capacity) * 100)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (org.currentStudents / org.capacity) * 100 > 90
                            ? "bg-red-500"
                            : (org.currentStudents / org.capacity) * 100 > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        data-width={`${Math.min(
                          (org.currentStudents / org.capacity) * 100,
                          100
                        )}%`}
                        style={{
                          width: `${Math.min(
                            (org.currentStudents / org.capacity) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(org)}
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
  );
};

function OrganizationsPage({ params }: OrganizationsPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Пользователь");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nameRu");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const ITEMS_PER_PAGE = 12;

  // Данные (в реальном приложении будут загружаться с сервера)
  const [organizations] = useState<OrganizationData[]>([
    {
      id: "1",
      nameRu: "Школа-лицей №165 имени Гани Муратбаева",
      nameKz: "Ғани Мұратбаев атындағы №165 мектеп-лицей",
      organizationType: "Государственное учреждение",
      district: "Алмалинский район",
      address: "ул. Толе би, 273/1",
      phone: "+7 (727) 292-15-46",
      director: "Ахметова Айгуль Кайратовна",
      currentRating: 85,
      currentStudents: 1250,
      capacity: 1400,
      ratingZone: "green",
      email: "school165@edu.kz",
    },
    {
      id: "2",
      nameRu: "Гимназия №148",
      nameKz: "№148 гимназия",
      organizationType: "Государственное учреждение",
      district: "Бостандыкский район",
      address: "ул. Сейфуллина, 458",
      phone: "+7 (727) 267-89-23",
      director: "Нурланов Ерлан Маратович",
      currentRating: 78,
      currentStudents: 980,
      capacity: 1200,
      ratingZone: "yellow",
      email: "gymnasium148@edu.kz",
    },
    {
      id: "3",
      nameRu: "Средняя школа №89",
      nameKz: "№89 орта мектеп",
      organizationType: "Государственное учреждение",
      district: "Турксибский район",
      address: "ул. Рыскулова, 123",
      phone: "+7 (727) 396-45-12",
      director: "Сарсенова Гульнара Амангельдиновна",
      currentRating: 65,
      currentStudents: 850,
      capacity: 1000,
      ratingZone: "red",
    },
    {
      id: "4",
      nameRu: "НИШ ФМН г. Алматы",
      nameKz: "Алматы қ. ФМБ НЗМ",
      organizationType: "Автономная организация образования",
      district: "Алатауский район",
      address: "ул. Шевченко, 189",
      phone: "+7 (727) 273-56-78",
      director: "Калиев Данияр Ермекович",
      currentRating: 92,
      currentStudents: 450,
      capacity: 500,
      ratingZone: "green",
      website: "https://fmsh.nis.edu.kz",
    },
    {
      id: "5",
      nameRu: "Лицей №28",
      nameKz: "№28 лицей",
      organizationType: "Государственное учреждение",
      district: "Медеуский район",
      address: "мкр. Самал-1, д. 15",
      phone: "+7 (727) 264-78-90",
      director: "Жанузакова Асель Болатовна",
      currentRating: 81,
      currentStudents: 1100,
      capacity: 1300,
      ratingZone: "green",
    },
    {
      id: "6",
      nameRu: "Средняя школа №156",
      nameKz: "№156 орта мектеп",
      organizationType: "Государственное учреждение",
      district: "Жетысуский район",
      address: "ул. Абая, 567",
      phone: "+7 (727) 398-23-45",
      director: "Темирбеков Нурлан Сериккалиевич",
      currentRating: 72,
      currentStudents: 1350,
      capacity: 1400,
      ratingZone: "yellow",
    },
    {
      id: "7",
      nameRu: "Международная школа Алматы",
      nameKz: "Алматы халықаралық мектебі",
      organizationType: "Частное учреждение",
      district: "Алатауский район",
      address: "ул. Тимирязева, 42",
      phone: "+7 (727) 250-12-34",
      director: "Джонсон Майкл Роберт",
      currentRating: 88,
      currentStudents: 320,
      capacity: 400,
      ratingZone: "green",
      website: "https://isa.kz",
    },
    {
      id: "8",
      nameRu: "Мектеп-гимназия №12",
      nameKz: "№12 мектеп-гимназия",
      organizationType: "Государственное учреждение",
      district: "Ауэзовский район",
      address: "мкр. Аксай-4, д. 62",
      phone: "+7 (727) 396-78-90",
      director: "Назарбаева Алма Серикбаевна",
      currentRating: 76,
      currentStudents: 1180,
      capacity: 1350,
      ratingZone: "yellow",
    },
  ]);

  const districts = [
    { id: "all", name: "Все районы" },
    { id: "almalinsky", name: "Алмалинский район" },
    { id: "bostandyksky", name: "Бостандыкский район" },
    { id: "turksibsky", name: "Турксибский район" },
    { id: "alatausky", name: "Алатауский район" },
    { id: "medeusky", name: "Медеуский район" },
    { id: "zhetysusky", name: "Жетысуский район" },
    { id: "auezovsky", name: "Ауэзовский район" },
  ];

  const stats = {
    totalOrganizations: organizations.length,
    greenZone: organizations.filter((o) => o.ratingZone === "green").length,
    yellowZone: organizations.filter((o) => o.ratingZone === "yellow").length,
    redZone: organizations.filter((o) => o.ratingZone === "red").length,
    totalStudents: organizations.reduce((sum, o) => sum + o.currentStudents, 0),
    totalCapacity: organizations.reduce((sum, o) => sum + o.capacity, 0),
    averageRating: Math.round(
      organizations.reduce((sum, o) => sum + o.currentRating, 0) /
        organizations.length
    ),
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

  const filteredOrganizations = organizations
    .filter((org) => {
      const matchesSearch =
        org.nameRu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.nameKz.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict =
        selectedDistrict === "all" ||
        org.district.toLowerCase().includes(selectedDistrict);
      return matchesSearch && (selectedDistrict === "all" || matchesDistrict);
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof OrganizationData];
      const bValue = b[sortBy as keyof OrganizationData];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  // Пагинация
  const totalPages = Math.ceil(filteredOrganizations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrganizations = filteredOrganizations.slice(
    startIndex,
    endIndex
  );

  const handleViewOrganization = (org: OrganizationData) => {
    window.location.href = `/${params.lang}/schools/passport/${org.id}`;
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleExport = () => {
    console.log("Экспорт данных:", filteredOrganizations);
    alert("Экспорт выполнен успешно!");
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
                  <Building2 className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Организации образования
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Каталог образовательных организаций
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
              <Link href={`/${params.lang}/schools`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <School className="h-4 w-4 mr-2" />
                  Рейтинг
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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-blue-700/90"></div>
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
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Каталог организаций образования
              </h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Полная база данных образовательных учреждений с детальной
                информацией о рейтингах, контактах и статистике.
              </p>
              <div className="flex items-center space-x-6 text-white/90">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(34,197,94,0.6)]"></div>
                  <span className="text-sm font-medium">Актуальные данные</span>
                </div>
                <div className="text-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
                  Обновлено: {new Date().toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
          <StatCard
            title="Всего организаций"
            value={stats.totalOrganizations}
            subtitle="Образовательных учреждений"
            icon={<Building2 className="h-6 w-6" />}
            variant="default"
          />

          <StatCard
            title="Зеленая зона"
            value={stats.greenZone}
            subtitle="Высокий рейтинг"
            icon={<Trophy className="h-6 w-6" />}
            variant="success"
            trend="up"
            trendValue="+8%"
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
            title="Всего учащихся"
            value={stats.totalStudents}
            subtitle="Человек"
            icon={<Users className="h-6 w-6" />}
            variant="default"
            trend="up"
            trendValue="+2.1%"
          />

          <StatCard
            title="Средний рейтинг"
            value={stats.averageRating}
            subtitle="По всем организациям"
            icon={<School className="h-6 w-6" />}
            variant="default"
            trend="up"
            trendValue="+1.8"
          />
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Поиск по названию, району, директору, адресу..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
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
                      <SelectValue placeholder="Выберите район" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleExport}
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

        {/* Organizations Content */}
        {viewMode === "table" ? (
          <OrganizationsTable
            organizations={currentOrganizations}
            onView={handleViewOrganization}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentOrganizations.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onView={handleViewOrganization}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
              <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Показано {startIndex + 1}-
                    {Math.min(endIndex, filteredOrganizations.length)} из{" "}
                    {filteredOrganizations.length}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Назад
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                currentPage === pageNumber
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNumber)}
                              className={`w-10 h-10 p-0 ${
                                currentPage === pageNumber
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                  : "bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                    >
                      Далее
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredOrganizations.length === 0 && (
          <div className="relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-12 text-center">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Организации не найдены
              </h3>
              <p className="text-slate-600 mb-6">
                Попробуйте изменить поисковый запрос или фильтры
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDistrict("all");
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
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

export default withAuth(OrganizationsPage);
