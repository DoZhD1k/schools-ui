/**
 * Simple Roles Test Page
 * Простая страница для тестирования системы ролей
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Users, Settings, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LoadingWithError,
  useErrorHandler,
} from "@/components/ui/error-display";

import { schoolRatingApiService } from "@/services/school-rating-api.service";
import { Role } from "@/types/school-rating-api";
import { useAuth } from "@/contexts/auth-context";

export default function SimpleRolesPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    clearError();

    try {
      const result = await schoolRatingApiService.getRoles();

      if (result.success && result.data) {
        setRoles(result.data);
        toast.success(`Загружено ${result.data.length} ролей`);
      } else {
        handleError({
          message: result.error || "Ошибка загрузки ролей",
          status: 400,
        });
      }
    } catch (err) {
      handleError(err);
    }

    setIsLoading(false);
  }, [clearError, handleError]);

  useEffect(() => {
    if (isAdmin) {
      loadRoles();
    }
  }, [isAdmin, loadRoles]);

  const getActivePermissionsCount = (role: Role) => {
    return [
      role.can_input_data,
      role.can_view_reports,
      role.can_view_analytics,
      role.can_form_rating,
    ].filter(Boolean).length;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Доступ запрещен
            </h3>
            <p className="text-gray-500">
              У вас нет прав для просмотра этой страницы
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <LoadingWithError
      isLoading={isLoading}
      error={error}
      onRetry={loadRoles}
      loadingText="Загрузка ролей..."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Роли системы</h1>
            <p className="text-muted-foreground">
              Просмотр ролей и прав доступа в системе
            </p>
          </div>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Создать роль
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего ролей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">в системе</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активных ролей
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  roles.filter((role) => getActivePermissionsCount(role) > 0)
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">с правами доступа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Средние права
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.length > 0
                  ? Math.round(
                      (roles.reduce(
                        (acc, role) => acc + getActivePermissionsCount(role),
                        0
                      ) /
                        roles.length) *
                        10
                    ) / 10
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">из 4 прав на роль</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список ролей ({roles.length})</CardTitle>
            <CardDescription>
              Все роли системы с информацией о правах доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название роли</TableHead>
                  <TableHead>Ввод данных</TableHead>
                  <TableHead>Просмотр отчетов</TableHead>
                  <TableHead>Аналитика</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Активных прав</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Роли не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            role.can_input_data ? "default" : "secondary"
                          }
                        >
                          {role.can_input_data ? "Да" : "Нет"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            role.can_view_reports ? "default" : "secondary"
                          }
                        >
                          {role.can_view_reports ? "Да" : "Нет"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            role.can_view_analytics ? "default" : "secondary"
                          }
                        >
                          {role.can_view_analytics ? "Да" : "Нет"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            role.can_form_rating ? "default" : "secondary"
                          }
                        >
                          {role.can_form_rating ? "Да" : "Нет"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getActivePermissionsCount(role)} из 4
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </LoadingWithError>
  );
}
