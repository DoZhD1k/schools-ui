"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, Eye, MoreHorizontal } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";

import {
  User,
  UserFilters,
  UserDetails,
  Role,
  Organization,
} from "../../types/user-management";
import { UserManagementService } from "../../services/user-management.service";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "../../lib/utils";

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Label>Показать:</Label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">
          {startItem}-{endItem} из {total}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Назад
        </Button>
        <span className="text-sm">
          Страница {currentPage} из {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Далее
        </Button>
      </div>
    </div>
  );
};

// User details modal
interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      UserManagementService.getUserDetails(user.id)
        .then((response) => {
          if (response.success && response.data) {
            setUserDetails(response.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Подробная информация об учетной записи</DialogTitle>
          <DialogDescription>
            Информация о пользователе {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Личные данные</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Фамилия</Label>
                  <p>{userDetails.lastName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Имя</Label>
                  <p>{userDetails.firstName}</p>
                </div>
                {userDetails.middleName && (
                  <div>
                    <Label className="text-gray-600">Отчество</Label>
                    <p>{userDetails.middleName}</p>
                  </div>
                )}
                {userDetails.birthDate && (
                  <div>
                    <Label className="text-gray-600">Дата рождения</Label>
                    <p>
                      {format(new Date(userDetails.birthDate), "dd.MM.yyyy", {
                        locale: ru,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Рабочая информация</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Район</Label>
                  <p>{userDetails.districtDetails?.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Организация</Label>
                  <p>{userDetails.organizationDetails?.name}</p>
                </div>
                {userDetails.department && (
                  <div>
                    <Label className="text-gray-600">Отдел</Label>
                    <p>{userDetails.department}</p>
                  </div>
                )}
                {userDetails.position && (
                  <div>
                    <Label className="text-gray-600">Должность</Label>
                    <p>{userDetails.position}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Учетная запись</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Логин</Label>
                  <p>{userDetails.login}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Статус</Label>
                  <Badge
                    variant={
                      userDetails.status === "active" ? "default" : "secondary"
                    }
                  >
                    {userDetails.status === "active"
                      ? "Активный"
                      : "Неактивный"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Роль</Label>
                  <p>{userDetails.roleDetails?.displayName}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Дата регистрации</Label>
                  <p>
                    {format(
                      new Date(userDetails.registrationDate),
                      "dd.MM.yyyy HH:mm",
                      { locale: ru }
                    )}
                  </p>
                </div>
                {userDetails.lastLoginAt && (
                  <div>
                    <Label className="text-gray-600">Последний вход</Label>
                    <p>
                      {format(
                        new Date(userDetails.lastLoginAt),
                        "dd.MM.yyyy HH:mm",
                        { locale: ru }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Права доступа</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {userDetails.roleDetails?.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {userDetails.permissions.map((permission) => (
                    <Badge
                      key={permission.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {permission.name}
                    </Badge>
                  ))}
                  {userDetails.roleDetails?.name === "administrator" && (
                    <Badge variant="default" className="text-xs">
                      Полный доступ
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Не удалось загрузить подробную информацию
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main users management component
interface AdminUsersTableProps {
  onAddUser?: () => void;
}

export default function AdminUsersTable({ onAddUser }: AdminUsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loginSearch, setLoginSearch] = useState("");

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data for filters
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Load filter data
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [rolesResponse, organizationsResponse] = await Promise.all([
          UserManagementService.getRoles(),
          UserManagementService.getOrganizations(),
        ]);

        if (rolesResponse.success) setRoles(rolesResponse.data || []);
        if (organizationsResponse.success)
          setOrganizations(organizationsResponse.data || []);
      } catch {
        // Ignore filter data loading errors
      }
    };

    loadFilterData();
  }, []);

  // Mock data loader (replace with real API call)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockUsers: User[] = [
        {
          id: "1",
          firstName: "Иван",
          lastName: "Иванов",
          middleName: "Иванович",
          birthDate: "1985-05-15",
          district: "Центральный район",
          organization: 'МБОУ "Школа №1"',
          department: "Администрация",
          position: "Директор",
          login: "ivanov_ivan",
          status: "active",
          role: "education_management",
          registrationDate: "2024-01-15T10:00:00Z",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          firstName: "Петр",
          lastName: "Петров",
          middleName: "Петрович",
          district: "Северный район",
          organization: 'МБОУ "Гимназия №5"',
          position: "Учитель математики",
          login: "petrov_petr",
          status: "active",
          role: "education_organization",
          registrationDate: "2024-02-01T09:30:00Z",
          createdAt: "2024-02-01T09:30:00Z",
          updatedAt: "2024-02-01T09:30:00Z",
        },
      ];

      setUsers(mockUsers);
      setTotal(mockUsers.length);
      setTotalPages(Math.ceil(mockUsers.length / pageSize));
    } catch {
      setError("Произошла ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load data when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleFilterChange = (
    key: keyof UserFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setLoginSearch("");
  };

  const hasActiveFilters =
    Object.values(filters).some(Boolean) || searchTerm || loginSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Пользователи</h2>
          <p className="text-gray-600">Управление пользователями системы</p>
        </div>
        <Button onClick={onAddUser} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Добавить пользователя</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Фильтры и поиск</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Поиск по ФИО</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Введите фамилию, имя или отчество"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginSearch">Поиск по логину</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="loginSearch"
                  placeholder="Введите логин"
                  value={loginSearch}
                  onChange={(e) => setLoginSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Организация</Label>
              <Select
                value={filters.organization || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "organization",
                    value === "all" ? "" : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все организации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все организации</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <Select
                value={filters.role || "all"}
                onValueChange={(value) =>
                  handleFilterChange("role", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all"
                      ? undefined
                      : (value as "active" | "inactive")
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {error ? (
            <Alert className="m-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Фамилия</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Отчество</TableHead>
                      <TableHead>Район</TableHead>
                      <TableHead>Организация</TableHead>
                      <TableHead>Должность</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          {[...Array(10)].map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="space-y-2">
                            <p className="text-gray-500">
                              Пользователи не найдены
                            </p>
                            {hasActiveFilters && (
                              <p className="text-sm text-gray-400">
                                Попробуйте сбросить фильтры или изменить
                                поисковый запрос
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRowClick(user)}
                        >
                          <TableCell className="font-medium">
                            {user.lastName}
                          </TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>{user.middleName || "—"}</TableCell>
                          <TableCell>{user.district}</TableCell>
                          <TableCell
                            className="max-w-48 truncate"
                            title={user.organization}
                          >
                            {user.organization}
                          </TableCell>
                          <TableCell>{user.position || "—"}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {user.login}
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), "dd.MM.yyyy", {
                              locale: ru,
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              )}
                            >
                              {user.status === "active"
                                ? "Активный"
                                : "Неактивный"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRowClick(user)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Подробнее
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

              {/* Pagination */}
              {!loading && users.length > 0 && (
                <div className="p-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newPageSize) => {
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
