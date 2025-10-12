"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useParams } from "next/navigation";
import {
  School,
  Building2,
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Trophy,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IntegratedSchoolsService } from "@/services/integrated-schools.service";
import { School as SchoolType } from "@/types/schools";
import {
  StatCard,
  OrganizationsTable,
  type OrganizationData,
} from "@/components/schools/organizations";

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

function OrganizationsPage() {
  const params = useParams() as { lang: string };
  const { lang } = params;
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserName] = useState<string>("Пользователь");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  // Убрали выбор вида - всегда таблица
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("nameRu");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Инициализация сервиса
  const ITEMS_PER_PAGE = 10;

  // Функция для конвертации School в формат организаций
  const convertToOrganizationData = (school: SchoolType): OrganizationData => {
    return {
      id: school.id.toString(),
      nameRu: school.nameRu,
      nameKz: school.nameKz || school.nameRu,
      organizationType: school.organizationType,
      district: school.district.nameRu,
      address: school.address,
      director: school.director,
      currentRating: school.currentRating,
      currentStudents: school.currentStudents,
      capacity: school.capacity,
      ratingZone: school.ratingZone,
    };
  };

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

  useEffect(() => {
    setCurrentPage(1); // Сбрасываем страницу при изменении поиска или района
  }, [selectedDistrict, debouncedSearchTerm]);

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
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Сбрасываем страницу при изменении поиска
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1); // Сбрасываем страницу при изменении района
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);

        // Загружаем ВСЕ школы без серверной фильтрации
        // Фильтрацию будем делать на клиенте, как на странице рейтинга
        const schools = await IntegratedSchoolsService.getSchools();

        // Конвертируем в формат организаций
        const orgsData = schools.map(convertToOrganizationData);
        setOrganizations(orgsData);
        setTotalCount(schools.length);
      } catch (error) {
        console.error("Ошибка загрузки организаций:", error);
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []); // Убираем зависимости - загружаем данные только один раз

  // Применяем фильтрацию локально, как на странице рейтинга
  const filteredAndSearchedOrganizations = organizations.filter((org) => {
    // Фильтр по району
    if (selectedDistrict !== "all") {
      const districtName = districts.find(
        (d) => d.id === selectedDistrict
      )?.name;
      if (districtName && org.district !== districtName) {
        return false;
      }
    }

    // Фильтр по поиску (как в DetailedRatingsTable)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      if (
        !org.nameRu.toLowerCase().includes(searchLower) &&
        !org.nameKz.toLowerCase().includes(searchLower) &&
        !org.address.toLowerCase().includes(searchLower) &&
        !(org.director && org.director.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    return true;
  });

  // Пагинация на клиенте
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrganizations = filteredAndSearchedOrganizations.slice(
    startIndex,
    endIndex
  );
  const totalPages = Math.ceil(
    filteredAndSearchedOrganizations.length / ITEMS_PER_PAGE
  );

  // Обновляем статистику на основе отфильтрованных данных
  const stats = {
    totalOrganizations: filteredAndSearchedOrganizations.length,
    greenZone: filteredAndSearchedOrganizations.filter(
      (o) => o.ratingZone === "green"
    ).length,
    yellowZone: filteredAndSearchedOrganizations.filter(
      (o) => o.ratingZone === "yellow"
    ).length,
    redZone: filteredAndSearchedOrganizations.filter(
      (o) => o.ratingZone === "red"
    ).length,
    totalStudents: filteredAndSearchedOrganizations.reduce(
      (sum, o) => sum + o.currentStudents,
      0
    ),
    totalCapacity: filteredAndSearchedOrganizations.reduce(
      (sum, o) => sum + o.capacity,
      0
    ),
    averageRating:
      filteredAndSearchedOrganizations.length > 0
        ? Math.round(
            filteredAndSearchedOrganizations.reduce(
              (sum, o) => sum + o.currentRating,
              0
            ) / filteredAndSearchedOrganizations.length
          )
        : 0,
  };

  const handleViewOrganization = (org: OrganizationData) => {
    window.location.href = `/${lang}/schools/passport/${org.id}`;
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
    console.log("Экспорт данных:", filteredAndSearchedOrganizations);
    alert("Экспорт выполнен успешно!");
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading || isLoadingOrgs) {
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
      {/* <header className="relative bg-white/80 backdrop-blur-md border-b border-[hsl(0_0%_100%_/_0.2)] shadow-sm">
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
              <Link href={`/${lang}/dashboard`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90 hover:border-[hsl(0_0%_100%_/_0.3)] shadow-sm transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Главная
                </Button>
              </Link>
              <Link href={`/${lang}/schools/rating`}>
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
      </header> */}

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
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                Общий рейтинг рассчитывается по взвешенной формуле с учетом
                качества знаний, динамики результатов, развития талантов,
                квалификации педагогов и других показателей.
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

      <main className="relative mx-auto px-6 py-12">
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

        {/* Organizations Content with Integrated Filters */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg">
          {/* Integrated Filters Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Поиск по названию, району, директору, адресу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-slate-200/60 focus:bg-white/90"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="w-48 bg-white/70 backdrop-blur-sm border-slate-200/60 focus:bg-white/90">
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
                  className="bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-white/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <OrganizationsTable
            organizations={currentOrganizations}
            onView={handleViewOrganization}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {/* Integrated Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Показано {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} из{" "}
                  {totalCount}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-white/90"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className={`w-10 h-10 p-0 ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                              : "bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-white/90"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-700 hover:bg-white/90"
                  >
                    Далее
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {currentOrganizations.length === 0 && !isLoadingOrgs && (
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
                  setDebouncedSearchTerm("");
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
