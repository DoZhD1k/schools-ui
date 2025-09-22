"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/components/hoc/withAuth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  BarChart3,
  MapPin,
  LogOut,
  ArrowLeft,
  User,
  Mail,
  Building,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AddUserPageProps {
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

function AddUserPage({ params }: AddUserPageProps) {
  const { accessToken, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Администратор");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: "",
    notes: "",
  });

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
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика создания пользователя
    console.log("Creating user:", formData);
    router.push(`/${params.lang}/admin/users`);
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
              <Link href={`/${params.lang}/admin/users`}>
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
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-lg transform hover:scale-105 transition-all duration-300">
                  <User className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Добавить пользователя
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Создание новой учетной записи
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
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur opacity-20"></div>
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
        <div className="max-w-2xl mx-auto">
          {/* Form */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
            <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
            <div className="relative p-8">
              <div className="mb-8 text-center">
                <div className="relative mb-4 mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur opacity-20"></div>
                  <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(16,185,129,0.25)]">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Создание нового пользователя
                </h2>
                <p className="text-slate-600">
                  Заполните форму для создания учетной записи
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-emerald-600" />
                    Личная информация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        placeholder="Введите имя"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        placeholder="Введите фамилию"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    Данные учетной записи
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Введите email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Пароль</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Введите пароль"
                            value={formData.password}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Подтвердите пароль
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Подтвердите пароль"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role and Organization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    Роль и организация
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80">
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Администратор</SelectItem>
                          <SelectItem value="education_management">
                            Управление образования
                          </SelectItem>
                          <SelectItem value="educational_institution">
                            Организации образования
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Организация</Label>
                      <Input
                        id="organization"
                        placeholder="Введите название организации"
                        value={formData.organization}
                        onChange={(e) =>
                          handleInputChange("organization", e.target.value)
                        }
                        className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-amber-600" />
                    Дополнительная информация
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Заметки</Label>
                    <Textarea
                      id="notes"
                      placeholder="Дополнительные заметки о пользователе..."
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      className="bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80 min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                    size="lg"
                  >
                    Создать пользователя
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                    size="lg"
                    onClick={() => router.push(`/${params.lang}/admin/users`)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(AddUserPage);
