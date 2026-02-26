/**
 * School Management Page
 * Страница управления данными школы
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePermissions, useCanAccessSchool } from "@/hooks/usePermissions";
import { SchoolDataGuard } from "@/components/auth/role-guard";
import {
  School,
  Building2,
  Users,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface SchoolData {
  id: number;
  name: string;
  address: string;
  director_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  type: string;
  status: string;
  student_count?: number;
  teacher_count?: number;
  established_year?: number;
  description?: string;
}

export default function SchoolManagementPage() {
  const params = useParams();
  const schoolId = parseInt(params.schoolId as string);
  const permissions = usePermissions();
  const canAccess = useCanAccessSchool(schoolId);

  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Загрузка данных школы
  const loadSchoolData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Заменить на реальный API вызов
      // const response = await schoolsApiService.getSchool(schoolId);
      // setSchoolData(response);

      // Временные моковые данные
      setTimeout(() => {
        setSchoolData({
          id: schoolId,
          name: `Школа №${schoolId}`,
          address: "ул. Примерная, 123, Алматы",
          director_name: "Иванов Иван Иванович",
          phone: "+7 (727) 123-45-67",
          email: `school${schoolId}@edu.kz`,
          website: `https://school${schoolId}.edu.kz`,
          type: "Государственная",
          status: "Активная",
          student_count: 850,
          teacher_count: 45,
          established_year: 1995,
          description:
            "Общеобразовательная школа с углубленным изучением математики и информатики.",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading school data:", error);
      setError("Ошибка при загрузке данных школы");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId && canAccess) {
      loadSchoolData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, canAccess]);

  const getAccessLevelBadge = () => {
    if (!permissions) return null;

    if (permissions.isAdmin()) {
      return <Badge variant="destructive">Полный доступ</Badge>;
    } else if (permissions.canManageAllSchools()) {
      return <Badge variant="secondary">Просмотр всех школ</Badge>;
    } else {
      return <Badge variant="outline">Только своя школа</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Загрузка данных школы...</p>
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
              <Button onClick={loadSchoolData} className="mt-4">
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Школа не найдена</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SchoolDataGuard
      schoolId={schoolId}
      fallback={
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center">
                <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Доступ запрещен
                </h3>
                <p className="text-gray-500">
                  У вас нет прав для просмотра данных этой школы
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">{schoolData.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {schoolData.address}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getAccessLevelBadge()}
            <Badge
              variant={
                schoolData.status === "Активная" ? "default" : "secondary"
              }
            >
              {schoolData.status}
            </Badge>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Учащиеся</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schoolData.student_count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Учителя</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schoolData.teacher_count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Год основания
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schoolData.established_year}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Табы с детальной информацией */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="staff">Персонал</TabsTrigger>
            <TabsTrigger value="statistics">Статистика</TabsTrigger>
            {permissions?.canInputData() && (
              <TabsTrigger value="edit">Редактировать</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Общая информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Тип учреждения
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {schoolData.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Директор</label>
                    <p className="text-sm text-muted-foreground">
                      {schoolData.director_name}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <p className="text-sm text-muted-foreground">
                    {schoolData.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schoolData.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schoolData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schoolData.email}</span>
                  </div>
                  {schoolData.website && (
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={schoolData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {schoolData.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Персонал</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Информация о персонале будет добавлена позже...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Статистические данные будут добавлены позже...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {permissions?.canInputData() && (
            <TabsContent value="edit">
              <Card>
                <CardHeader>
                  <CardTitle>Редактирование данных</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Форма редактирования будет добавлена позже...
                  </p>
                  <Button>Сохранить изменения</Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </SchoolDataGuard>
  );
}
