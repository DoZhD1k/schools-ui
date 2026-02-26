/**
 * Simple Roles Test Page
 * Простая страница для тестирования системы ролей
 */

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LoadingWithError,
  useErrorHandler,
} from "@/components/ui/error-display";

import { adminApiService, Role } from "@/services/admin-api.service";
import { useAuth } from "@/contexts/auth-context";
import { CreateRoleForm } from "./create-role-form";
import { EditRoleForm } from "./edit-role-form";

export default function SimpleRolesPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const hasLoadedRef = useRef(false);

  // Состояния для диалогов
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  useEffect(() => {
    if (!isAdmin || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadRoles = async () => {
      setIsLoading(true);
      clearError();

      try {
        const rolesData = await adminApiService.getRoles();
        setRoles(rolesData);
        toast.success(`Загружено ${rolesData.length} ролей`);
      } catch (err) {
        handleError({
          message: err instanceof Error ? err.message : "Ошибка загрузки ролей",
          status: 400,
        });
      }

      setIsLoading(false);
    };

    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]); // Убираем clearError и handleError из зависимостей

  const retryLoadRoles = () => {
    if (isAdmin) {
      hasLoadedRef.current = false; // Сбрасываем флаг для повторной загрузки
      setIsLoading(true);
      clearError();

      adminApiService
        .getRoles()
        .then((rolesData) => {
          setRoles(rolesData);
          toast.success(`Загружено ${rolesData.length} ролей`);
          hasLoadedRef.current = true;
        })
        .catch((err) => {
          handleError({
            message:
              err instanceof Error ? err.message : "Ошибка загрузки ролей",
            status: 400,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Функции управления ролями
  const handleCreateRole = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    hasLoadedRef.current = false;
    retryLoadRoles();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingRole(null);
    hasLoadedRef.current = false;
    retryLoadRoles();
  };

  const handleDeleteRole = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!deletingRole) return;

    setIsDeletingRole(true);
    try {
      await adminApiService.deleteRole(deletingRole.id);
      toast.success(`Роль "${deletingRole.name}" успешно удалена`);
      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
      hasLoadedRef.current = false;
      retryLoadRoles();
    } catch (error) {
      toast.error("Ошибка удаления роли", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    } finally {
      setIsDeletingRole(false);
    }
  };

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
      onRetry={retryLoadRoles}
      loadingText="Загрузка ролей..."
    >
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
              Роли системы
            </h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Просмотр ролей и прав доступа в системе
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Создать роль
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создание новой роли</DialogTitle>
              </DialogHeader>
              <CreateRoleForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
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
                        0,
                      ) /
                        roles.length) *
                        10,
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
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название роли</TableHead>
                    <TableHead>Ввод данных</TableHead>
                    <TableHead>Просмотр отчетов</TableHead>
                    <TableHead>Аналитика</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead>Активных прав</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Загрузка...
                      </TableCell>
                    </TableRow>
                  ) : roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
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
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Открыть меню</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRole(role)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Диалог редактирования роли */}
        {editingRole && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Редактирование роли</DialogTitle>
              </DialogHeader>
              <EditRoleForm role={editingRole} onSuccess={handleEditSuccess} />
            </DialogContent>
          </Dialog>
        )}

        {/* Диалог подтверждения удаления */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить роль &quot;{deletingRole?.name}
                &quot;? Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingRole}>
                Отменить
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteRole}
                disabled={isDeletingRole}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingRole ? "Удаление..." : "Удалить"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </LoadingWithError>
  );
}
