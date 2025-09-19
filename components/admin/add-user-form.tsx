"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Info, AlertCircle, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import {
  CreateUserForm,
  UserStatus,
  Role,
  Organization,
  District,
  User,
} from "@/types/user-management";
import { UserManagementService } from "@/services/user-management.service";
import {
  getPermissionsByRole,
  groupPermissionsByCategory,
  PERMISSIONS,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

// Form validation schema
const createUserSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  middleName: z.string().optional(),
  birthDate: z.string().optional(),
  district: z.string().min(1, "Район обязателен"),
  organization: z.string().min(1, "Организация обязательна"),
  department: z.string().optional(),
  position: z.string().optional(),
  login: z
    .string()
    .min(3, "Логин должен содержать минимум 3 символа")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Логин может содержать только латинские буквы, цифры, дефис и подчеркивание"
    ),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать заглавные и строчные буквы, цифры"
    ),
  status: z.enum(["active", "inactive"]),
  role: z.string().min(1, "Роль обязательна"),
});

type FormData = z.infer<typeof createUserSchema>;

interface AddUserFormProps {
  onSuccess?: (user: User) => void;
  onCancel?: () => void;
}

export default function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginValidation, setLoginValidation] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isChecking: false, isAvailable: null, message: "" });

  // Data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [birthDate, setBirthDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      status: "active",
    },
  });

  const watchedLogin = watch("login");
  const watchedRole = watch("role");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesResponse, organizationsResponse, districtsResponse] =
          await Promise.all([
            UserManagementService.getRoles(),
            UserManagementService.getOrganizations(),
            UserManagementService.getDistricts(),
          ]);

        if (rolesResponse.success) setRoles(rolesResponse.data || []);
        if (organizationsResponse.success)
          setOrganizations(organizationsResponse.data || []);
        if (districtsResponse.success)
          setDistricts(districtsResponse.data || []);
      } catch {
        console.error("Failed to load form data");
      }
    };

    loadData();
  }, []);

  // Update selected role when role changes
  useEffect(() => {
    if (watchedRole) {
      const role = roles.find((r) => r.id === watchedRole);
      setSelectedRole(role || null);
    } else {
      setSelectedRole(null);
    }
  }, [watchedRole, roles]);

  // Debounced login validation
  const validateLogin = useCallback(
    async (login: string) => {
      if (!login || login.length < 3) {
        setLoginValidation({
          isChecking: false,
          isAvailable: null,
          message: "",
        });
        return;
      }

      setLoginValidation({ isChecking: true, isAvailable: null, message: "" });

      try {
        const response = await UserManagementService.validateLogin(login);
        if (response.success && response.data) {
          const { isAvailable, suggestions } = response.data;
          setLoginValidation({
            isChecking: false,
            isAvailable,
            message: isAvailable
              ? "Логин доступен"
              : `Логин занят${
                  suggestions?.length
                    ? `. Попробуйте: ${suggestions.join(", ")}`
                    : ""
                }`,
          });

          if (!isAvailable) {
            setError("login", { message: "Этот логин уже занят" });
          } else {
            clearErrors("login");
          }
        }
      } catch {
        setLoginValidation({
          isChecking: false,
          isAvailable: null,
          message: "Ошибка проверки логина",
        });
      }
    },
    [setError, clearErrors]
  );

  // Debounce login validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateLogin(watchedLogin);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedLogin, validateLogin]);

  const onSubmit = async (data: FormData) => {
    if (!loginValidation.isAvailable && loginValidation.isAvailable !== null) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: CreateUserForm = {
        ...data,
        middleName: data.middleName || "",
        department: data.department || "",
        position: data.position || "",
        birthDate: birthDate ? format(birthDate, "yyyy-MM-dd") : "",
      };

      const response = await UserManagementService.createUser(formData);

      if (response.success && response.data) {
        onSuccess?.(response.data);
        reset();
        setBirthDate(undefined);
        setSelectedRole(null);
      } else {
        setError("root", {
          message:
            response.error || "Произошла ошибка при создании пользователя",
        });
      }
    } catch (error) {
      setError("root", { message: "Произошла неизвестная ошибка" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset();
    setBirthDate(undefined);
    setSelectedRole(null);
    setLoginValidation({ isChecking: false, isAvailable: null, message: "" });
  };

  // Get permissions for selected role
  const rolePermissions = selectedRole
    ? groupPermissionsByCategory(getPermissionsByRole(selectedRole.name))
    : {};

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg">
          <div className="p-2 bg-white/20 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Добавление нового пользователя</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Создание новой учетной записи в системе управления образованием
        </p>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Форма регистрации пользователя
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Заполните все обязательные поля для создания учетной записи
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {errors.root && (
              <Alert
                variant="destructive"
                className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Личные данные
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Фамилия <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Введите фамилию"
                    className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20"
                    {...register("lastName")}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                  />
                  {errors.lastName && (
                    <p
                      id="lastName-error"
                      className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Имя <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Введите имя"
                    className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20"
                    {...register("firstName")}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                  />
                  {errors.firstName && (
                    <p
                      id="firstName-error"
                      className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="middleName"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Отчество
                  </Label>
                  <Input
                    id="middleName"
                    placeholder="Введите отчество (необязательно)"
                    className="h-12 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20"
                    {...register("middleName")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Дата рождения</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700",
                          !birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? (
                          format(birthDate, "dd MMMM yyyy г.", { locale: ru })
                        ) : (
                          <span>Выберите дату рождения</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                        {/* Year and Month Selectors */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-semibold">
                                Год:
                              </Label>
                              <Select
                                value={
                                  birthDate
                                    ? birthDate.getFullYear().toString()
                                    : ""
                                }
                                onValueChange={(year) => {
                                  const currentMonth = birthDate
                                    ? birthDate.getMonth()
                                    : 0;
                                  const currentDay = birthDate
                                    ? birthDate.getDate()
                                    : 1;
                                  setBirthDate(
                                    new Date(
                                      parseInt(year),
                                      currentMonth,
                                      currentDay
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="w-24 h-8 text-sm">
                                  <SelectValue placeholder="Год" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 100 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                      <SelectItem
                                        key={year}
                                        value={year.toString()}
                                      >
                                        {year}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-semibold">
                                Месяц:
                              </Label>
                              <Select
                                value={
                                  birthDate
                                    ? birthDate.getMonth().toString()
                                    : ""
                                }
                                onValueChange={(month) => {
                                  const currentYear = birthDate
                                    ? birthDate.getFullYear()
                                    : new Date().getFullYear() - 25;
                                  const currentDay = birthDate
                                    ? birthDate.getDate()
                                    : 1;
                                  setBirthDate(
                                    new Date(
                                      currentYear,
                                      parseInt(month),
                                      currentDay
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="w-32 h-8 text-sm">
                                  <SelectValue placeholder="Месяц" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Январь",
                                    "Февраль",
                                    "Март",
                                    "Апрель",
                                    "Май",
                                    "Июнь",
                                    "Июль",
                                    "Август",
                                    "Сентябрь",
                                    "Октябрь",
                                    "Ноябрь",
                                    "Декабрь",
                                  ].map((monthName, index) => (
                                    <SelectItem
                                      key={index}
                                      value={index.toString()}
                                    >
                                      {monthName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Calendar */}
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={setBirthDate}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1920-01-01")
                          }
                          initialFocus
                          className="p-0"
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption:
                              "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button:
                              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell:
                              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors",
                            day_selected:
                              "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                            day_today:
                              "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300 font-semibold",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle:
                              "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">
                    Район <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("district", value)}
                  >
                    <SelectTrigger
                      id="district"
                      aria-invalid={!!errors.district}
                    >
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
                  {errors.district && (
                    <p className="text-sm text-red-500">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Рабочая информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">
                    Наименование организации{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("organization", value)}
                  >
                    <SelectTrigger
                      id="organization"
                      aria-invalid={!!errors.organization}
                    >
                      <SelectValue placeholder="Выберите организацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organization && (
                    <p className="text-sm text-red-500">
                      {errors.organization.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Отдел</Label>
                  <Input
                    id="department"
                    placeholder="Введите отдел"
                    {...register("department")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  placeholder="Введите должность"
                  {...register("position")}
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Учетная запись</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="login">
                    Логин <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="login"
                      placeholder="Введите логин"
                      {...register("login")}
                      aria-invalid={!!errors.login}
                      aria-describedby={
                        errors.login ? "login-error" : undefined
                      }
                      className={cn(
                        loginValidation.isAvailable === false &&
                          "border-red-500",
                        loginValidation.isAvailable === true &&
                          "border-green-500"
                      )}
                    />
                    {loginValidation.isChecking && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {errors.login && (
                    <p id="login-error" className="text-sm text-red-500">
                      {errors.login.message}
                    </p>
                  )}
                  {loginValidation.message && (
                    <p
                      className={cn(
                        "text-sm",
                        loginValidation.isAvailable
                          ? "text-green-600"
                          : "text-red-500"
                      )}
                    >
                      {loginValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Пароль <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : "password-hint"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  <p id="password-hint" className="text-sm text-gray-500">
                    Может быть изменён в Личном кабинете
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <RadioGroup
                    value={watch("status")}
                    onValueChange={(value: UserStatus) =>
                      setValue("status", value)
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="status-active" />
                      <Label htmlFor="status-active">Активный</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="status-inactive" />
                      <Label htmlFor="status-inactive">Неактивный</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="role">
                      Роль <span className="text-red-500">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Выбор роли изменит перечень прав в блоке ниже</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select onValueChange={(value) => setValue("role", value)}>
                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Дата регистрации</Label>
                <Input
                  value={format(new Date(), "dd.MM.yyyy HH:mm", {
                    locale: ru,
                  })}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Автоматически заполняется системой
                </p>
              </div>
            </div>

            {/* Permissions Preview */}
            {selectedRole && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Права доступа</h3>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {selectedRole.displayName}
                    </CardTitle>
                    <CardDescription>
                      {selectedRole.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(rolePermissions).map(
                        ([categoryId, permissions]) => (
                          <div key={categoryId} className="space-y-2">
                            <h4 className="font-medium text-sm">
                              {
                                PERMISSIONS.find(
                                  (p) => p.category.id === categoryId
                                )?.category.name
                              }
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {permissions.map((permission) => (
                                <Badge
                                  key={permission.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {permission.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                      {selectedRole.name === "administrator" && (
                        <Badge variant="default" className="text-xs">
                          Полный доступ ко всем функциям системы
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Очистить
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (!loginValidation.isAvailable &&
                    loginValidation.isAvailable !== null)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
