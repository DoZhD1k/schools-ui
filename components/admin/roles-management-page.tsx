/**
 * Roles Management Page
 * Страница управления ролями для администраторов
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { schoolRatingApiService } from "@/services/school-rating-api.service";
import { Role } from "@/types/school-rating-api";
import { RoleManagementGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/contexts/auth-context";
import { CreateRoleForm } from "./create-role-form";
import { EditRoleForm } from "./edit-role-form";

export default function RolesManagementPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Загрузка ролей
  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await schoolRatingApiService.getRoles({
        search: searchTerm || undefined,
      });

      if (result.success && result.data) {
        setRoles(result.data);
      } else {
        toast.error("Ошибка загрузки ролей", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Ошибка загрузки ролей", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
    setIsLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      loadRoles();
    }
  }, [isAdmin, searchTerm, loadRoles]);

  // Обработчик удаления роли
  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить роль "${roleName}"?`)) {
      return;
    }

    try {
      const result = await schoolRatingApiService.deleteRole(roleId);

      if (result.success) {
        toast.success("Роль удалена");
        loadRoles(); // Перезагружаем список
      } else {
        toast.error("Ошибка удаления роли", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Ошибка удаления роли", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  // Фильтрация ролей
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Компонент для отображения прав
  const PermissionIcon = ({
    hasPermission,
    label,
  }: {
    hasPermission: boolean;
    label: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {hasPermission ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-gray-400" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {label}: {hasPermission ? "Разрешено" : "Запрещено"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Компонент для отображения всех прав роли
  const RolePermissions = ({ role }: { role: Role }) => (
    <div className="flex items-center space-x-2">
      <PermissionIcon hasPermission={role.can_input_data} label="Ввод данных" />
      <PermissionIcon
        hasPermission={role.can_view_reports}
        label="Просмотр отчетов"
      />
      <PermissionIcon
        hasPermission={role.can_view_analytics}
        label="Просмотр аналитики"
      />
      <PermissionIcon
        hasPermission={role.can_form_rating}
        label="Формирование рейтинга"
      />
    </div>
  );

  // Подсчет активных прав
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
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Управление ролями
          </h1>
          <p className="text-muted-foreground">
            Настройте роли и права доступа в системе
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать роль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать новую роль</DialogTitle>
              <DialogDescription>
                Определите название роли и настройте права доступа
              </DialogDescription>
            </DialogHeader>
            <CreateRoleForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadRoles();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Информационная панель */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Роли определяют, какие действия могут выполнять пользователи в
          системе. Изменения прав применяются для всех пользователей с данной
          ролью.
        </AlertDescription>
      </Alert>

      {/* Поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск ролей</CardTitle>
          <CardDescription>Найдите нужную роль по названию</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию роли..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица ролей */}
      <Card>
        <CardHeader>
          <CardTitle>Роли системы ({filteredRoles.length})</CardTitle>
          <CardDescription>
            Список всех ролей с настройками прав доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название роли</TableHead>
                <TableHead>Права доступа</TableHead>
                <TableHead>Активных прав</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Роли не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="font-medium">{role.name}</div>
                    </TableCell>
                    <TableCell>
                      <RolePermissions role={role} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getActivePermissionsCount(role)} из 4
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Детальная информация о правах */}
      <Card>
        <CardHeader>
          <CardTitle>Описание прав доступа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Ввод данных</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Возможность добавлять и редактировать данные о школах
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Просмотр отчетов</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Доступ к просмотру отчетов и статистики
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Просмотр аналитики</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Доступ к аналитическим данным и метрикам
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Формирование рейтинга</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Права на создание и изменение рейтингов школ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диалог редактирования роли */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать роль</DialogTitle>
            <DialogDescription>
              Измените название роли и настройки прав доступа
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <EditRoleForm
              role={selectedRole}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedRole(null);
                loadRoles();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
