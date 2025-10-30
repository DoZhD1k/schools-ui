/**
 * Create User Form
 * Форма создания нового пользователя
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { schoolRatingApiService } from "@/services/school-rating-api.service";
import { Role, CreateUserRequest } from "@/types/school-rating-api";

const createUserSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  first_name: z.string().min(1, "Имя обязательно"),
  last_name: z.string().min(1, "Фамилия обязательна"),
  patronymic: z.string().optional(),
  birth_date: z.string().optional(),
  position: z.string().min(1, "Должность обязательна"),
  role: z.number().min(1, "Выберите роль"),
  school: z.number().optional(),
  is_active: z.boolean().default(true),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  roles: Role[];
  onSuccess: () => void;
}

export function CreateUserForm({ roles, onSuccess }: CreateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      patronymic: "",
      birth_date: "",
      position: "",
      role: undefined,
      school: undefined,
      is_active: true,
    },
  });

  const selectedRole = form.watch("role");
  const selectedRoleData = roles.find((role) => role.id === selectedRole);
  const isAdminRole = selectedRoleData?.name === "Администратор";

  async function onSubmit(values: CreateUserFormData) {
    setIsLoading(true);

    try {
      // Подготавливаем данные для API
      const userData: CreateUserRequest = {
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        position: values.position,
        role: values.role,
      };

      // Добавляем опциональные поля только если они заполнены
      if (values.patronymic) {
        userData.patronymic = values.patronymic;
      }

      if (values.birth_date) {
        userData.birth_date = values.birth_date;
      }

      // Для администраторов school = null, для других ролей - обязательно
      if (!isAdminRole && values.school) {
        userData.school = values.school;
      }

      const result = await schoolRatingApiService.createUser(userData);

      if (result.success) {
        toast.success("Пользователь создан", {
          description: `Пользователь ${values.first_name} ${values.last_name} успешно создан`,
        });
        onSuccess();
      } else {
        toast.error("Ошибка создания пользователя", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Ошибка создания пользователя", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Email адрес будет использоваться для входа в систему
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Пароль */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Пароль *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Минимум 6 символов"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Имя */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя *</FormLabel>
                <FormControl>
                  <Input placeholder="Иван" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Фамилия */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фамилия *</FormLabel>
                <FormControl>
                  <Input placeholder="Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Отчество */}
          <FormField
            control={form.control}
            name="patronymic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Отчество</FormLabel>
                <FormControl>
                  <Input placeholder="Иванович" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Дата рождения */}
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата рождения</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Должность */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Должность *</FormLabel>
                <FormControl>
                  <Input placeholder="Директор" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Роль */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Роль *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Школа (только для не-администраторов) */}
          {!isAdminRole && (
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Школа {!isAdminRole && "*"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="ID школы"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Временно используется ID школы. В будущем будет выпадающий
                    список.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Активность */}
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Активный пользователь</FormLabel>
                  <FormDescription>
                    Неактивные пользователи не могут войти в систему
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Права выбранной роли */}
        {selectedRoleData && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">
              Права роли &ldquo;{selectedRoleData.name}&rdquo;:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedRoleData.can_input_data
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>Ввод данных</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedRoleData.can_view_reports
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>Просмотр отчетов</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedRoleData.can_view_analytics
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>Просмотр аналитики</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedRoleData.can_form_rating
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>Формирование рейтинга</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Создание..." : "Создать пользователя"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
