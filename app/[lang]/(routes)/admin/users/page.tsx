"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Users,
  BarChart3,
  MapPin,
  LogOut,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface AdminUsersPageProps {
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

// Типы для пользователя
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  organization: string;
  lastLogin: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}

// Компонент карточки пользователя
const UserCard = ({ user, onEdit, onDelete, onView }: UserCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Администратор":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Управление образования":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Организации образования":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20"></div>
              <Avatar className="relative h-12 w-12 bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)]">
                <AvatarFallback className="bg-transparent text-slate-700 font-semibold">
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {user.name || "Не указано"}
              </h3>
              <p className="text-sm text-slate-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                    user.status
                  )}`}
                >
                  {user.status === "active"
                    ? "Активен"
                    : user.status === "inactive"
                    ? "Неактивен"
                    : "Ожидание"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(user)}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              className="h-8 w-8 p-0 hover:bg-amber-50"
            >
              <Edit className="h-4 w-4 text-amber-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              className="h-8 w-8 p-0 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Организация:</span>
            <p className="font-medium text-slate-800">
              {user.organization || "Не указана"}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Последний вход:</span>
            <p className="font-medium text-slate-800">
              {user.lastLogin || "Никогда"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { accessToken, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Администратор");
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState([
    {
      id: 1,
      name: "Иван Иванов",
      email: "ivan@education.kz",
      role: "Администратор",
      status: "active",
      organization: "Министерство образования",
      lastLogin: "2 часа назад",
    },
    {
      id: 2,
      name: "Мария Петрова",
      email: "maria@school1.kz",
      role: "Управление образования",
      status: "active",
      organization: "Управление образования г. Алматы",
      lastLogin: "1 день назад",
    },
    {
      id: 3,
      name: "Алексей Сидоров",
      email: "alex@gymnasium5.kz",
      role: "Организации образования",
      status: "active",
      organization: "МБОУ Гимназия №5",
      lastLogin: "3 дня назад",
    },
    {
      id: 4,
      name: "Анна Козлова",
      email: "anna@lyceum3.kz",
      role: "Организации образования",
      status: "inactive",
      organization: "МБОУ Лицей №3",
      lastLogin: "Никогда",
    },
    {
      id: 5,
      name: "Дмитрий Новиков",
      email: "dmitry@school7.kz",
      role: "Организации образования",
      status: "pending",
      organization: "МБОУ Школа №7",
      lastLogin: "Никогда",
    },
  ]);

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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: User) => {
    console.log("View user:", user);
  };

  const handleEditUser = (user: User) => {
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    console.log("Delete user:", user);
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
              <Link href={`/${params.lang}/admin`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:bg-slate-100/80 mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Users className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Управление пользователями
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  {filteredUsers.length} пользователей
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

      <main className="relative container mx-auto px-6 py-12">
        {/* Search and Actions */}
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
                      placeholder="Поиск по имени, email или организации..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                  <Link href={`/${params.lang}/admin/users/add`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Добавить пользователя
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-12 text-center">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Пользователи не найдены
              </h3>
              <p className="text-slate-600 mb-6">
                Попробуйте изменить поисковый запрос или добавить нового
                пользователя
              </p>
              <Link href={`/${params.lang}/admin/users/add`}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Добавить пользователя
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(AdminUsersPage);
