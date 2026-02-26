/**
 * Schools List Page
 * Страница со списком школ с учетом прав доступа
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePermissions, useDataFilter } from "@/hooks/usePermissions";
import {
  School,
  Search,
  MapPin,
  Users,
  ExternalLink,
  Filter,
} from "lucide-react";

interface School {
  id: number;
  name: string;
  address: string;
  student_count?: number;
  type: string;
  status: string;
  school_id?: number; // для совместимости с фильтрацией
}

export default function SchoolsListPage() {
  const params = useParams();
  const lang = params.lang as string;
  const permissions = usePermissions();
  const { filterSchoolData } = useDataFilter();

  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка школ
  const loadSchools = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Заменить на реальный API вызов
      // const response = await schoolsApiService.getSchools();

      // Временные моковые данные
      setTimeout(() => {
        const mockSchools: School[] = [
          {
            id: 1,
            school_id: 1,
            name: "Школа №1 им. А.С. Пушкина",
            address: "ул. Абая, 123, Алматы",
            student_count: 850,
            type: "Государственная",
            status: "Активная",
          },
          {
            id: 2,
            school_id: 2,
            name: "Гимназия №15",
            address: "проспект Достык, 45, Алматы",
            student_count: 650,
            type: "Государственная",
            status: "Активная",
          },
          {
            id: 3,
            school_id: 3,
            name: "Лицей «Білім-Инновация»",
            address: "ул. Сатпаева, 78, Алматы",
            student_count: 420,
            type: "Частная",
            status: "Активная",
          },
          {
            id: 4,
            school_id: 4,
            name: "Школа №25",
            address: "ул. Розыбакиева, 234, Алматы",
            student_count: 720,
            type: "Государственная",
            status: "Реорганизация",
          },
        ];

        // Применяем фильтрацию по правам доступа
        const accessibleSchools = filterSchoolData(mockSchools);
        setSchools(accessibleSchools);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading schools:", error);
      setError("Ошибка при загрузке списка школ");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Фильтрация по поисковому запросу
  useEffect(() => {
    const filtered = schools.filter(
      (school) =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredSchools(filtered);
  }, [schools, searchQuery]);

  const getAccessInfo = () => {
    if (!permissions) return "";

    if (permissions.isAdmin()) {
      return "Администратор - полный доступ";
    } else if (permissions.canManageAllSchools()) {
      return "Управление образования - все школы";
    } else {
      return "Организация образования - только своя школа";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Загрузка списка школ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={loadSchools} className="mt-4">
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6">
      {/* Заголовок и информация о доступе */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Школы</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Управление образовательными учреждениями
          </p>
        </div>
        <div className="sm:text-right">
          <Badge variant="outline" className="mb-1 md:mb-2 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            {getAccessInfo()}
          </Badge>
          <p className="text-xs md:text-sm text-muted-foreground">
            Показано: {filteredSchools.length} из {schools.length}
          </p>
        </div>
      </div>

      {/* Поиск */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск школ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Список школ */}
      {filteredSchools.length > 0 ? (
        <div className="grid gap-4">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-sm md:text-lg">
                      {school.name}
                    </CardTitle>
                    <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {school.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        school.status === "Активная" ? "default" : "secondary"
                      }
                    >
                      {school.status}
                    </Badge>
                    <Badge variant="outline">{school.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    Учащиеся: {school.student_count || "Н/Д"}
                  </div>
                  <div className="flex gap-2">
                    {permissions?.canInputData() && (
                      <Link href={`/${lang}/schools/${school.id}`}>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Управление
                        </Button>
                      </Link>
                    )}
                    <Link href={`/${lang}/schools/${school.id}`}>
                      <Button size="sm">Просмотр</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Школы не найдены
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "У вас нет доступа к школам или данные не загружены"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
