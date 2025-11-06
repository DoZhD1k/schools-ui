/**
 * Users Management Page
 * Страница управления пользователями для администраторов
 */

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { adminApiService } from "@/services/admin-api.service";
import { User, Role } from "@/services/admin-api.service";
import { useAuth } from "@/contexts/auth-context";
import { CreateUserForm } from "./create-user-form";
import { EditUserForm } from "./edit-user-form";

export default function UsersManagementPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Загрузка данных
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const users = await adminApiService.getUsers({
        search: searchTerm || undefined,
      });
      setUsers(users);
    } catch (error) {
      toast.error("Ошибка загрузки пользователей", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
    setIsLoading(false);
  };

  const loadRoles = async () => {
    try {
      const roles = await adminApiService.getRoles();
      setRoles(roles);
    } catch (error) {
      toast.error("Ошибка загрузки ролей", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
    }
  }, [isAdmin, searchTerm]); // loadUsers и loadRoles не добавляем в зависимости, так как они стабильны

  // Обработчики действий
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      await adminApiService.deleteUser(userId);
      toast.success("Пользователь удален");
      loadUsers(); // Перезагружаем список
    } catch (error) {
      toast.error("Ошибка удаления пользователя", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await adminApiService.updateUser(user.id, {
        is_active: !user.is_active,
      });
      toast.success(
        `Пользователь ${user.is_active ? "деактивирован" : "активирован"}`
      );
      loadUsers(); // Перезагружаем список
    } catch (error) {
      toast.error("Ошибка изменения статуса пользователя", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  };

  // Фильтрация пользователей
  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getUserInitials = (user: User) => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "Администратор":
        return "destructive";
      case "Организация образования":
        return "secondary";
      default:
        return "outline";
    }
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
            Управление пользователями
          </h1>
          <p className="text-muted-foreground">
            Управляйте пользователями системы и их правами доступа
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать нового пользователя</DialogTitle>
              <DialogDescription>
                Заполните форму для создания нового пользователя системы
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              roles={roles}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                loadUsers();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
          <CardDescription>
            Найдите нужных пользователей с помощью поиска и фильтров
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по email, имени или роли..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Список всех пользователей системы с возможностью управления
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Школа</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/avatars/${user.id}.png`} />
                          <AvatarFallback>
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.patronymic && (
                            <div className="text-sm text-muted-foreground">
                              {user.patronymic}
                            </div>
                          )}
                          {user.position && (
                            <div className="text-xs text-muted-foreground">
                              {user.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role_name)}>
                        {user.role_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.school_name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Активен" : "Неактивен"}
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
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.is_active ? "Деактивировать" : "Активировать"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
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
        </CardContent>
      </Card>

      {/* Диалог редактирования пользователя */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените информацию о пользователе
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              roles={roles}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                loadUsers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
