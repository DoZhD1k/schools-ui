/**
 * Create Role Form
 * Форма создания новой роли
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { schoolRatingApiService } from "@/services/school-rating-api.service";

interface CreateRoleFormData {
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

interface CreateRoleFormProps {
  onSuccess: () => void;
}

export function CreateRoleForm({ onSuccess }: CreateRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateRoleFormData>({
    defaultValues: {
      name: "",
      can_input_data: false,
      can_view_reports: false,
      can_view_analytics: false,
      can_form_rating: false,
    },
  });

  const watchedFields = watch();

  const onSubmit = async (data: CreateRoleFormData) => {
    setIsLoading(true);

    try {
      const result = await schoolRatingApiService.createRole({
        name: data.name.trim(),
        can_input_data: data.can_input_data,
        can_view_reports: data.can_view_reports,
        can_view_analytics: data.can_view_analytics,
        can_form_rating: data.can_form_rating,
      });

      if (result.success) {
        toast.success("Роль успешно создана");
        reset();
        onSuccess();
      } else {
        toast.error("Ошибка создания роли", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Ошибка создания роли", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }

    setIsLoading(false);
  };

  const handlePermissionChange = (
    permission: keyof Omit<CreateRoleFormData, "name">,
    checked: boolean
  ) => {
    setValue(permission, checked, { shouldValidate: true });
  };

  // Подсчет активных прав
  const activePermissions = [
    watchedFields.can_input_data,
    watchedFields.can_view_reports,
    watchedFields.can_view_analytics,
    watchedFields.can_form_rating,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название роли *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Введите название роли"
            {...register("name", {
              required: "Название роли обязательно",
              minLength: {
                value: 2,
                message: "Название должно содержать минимум 2 символа",
              },
              maxLength: {
                value: 100,
                message: "Название не должно превышать 100 символов",
              },
            })}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Права доступа */}
      <Card>
        <CardHeader>
          <CardTitle>Права доступа ({activePermissions} из 4)</CardTitle>
          <CardDescription>
            Выберите права, которые будут предоставлены пользователям с этой
            ролью
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="can_input_data"
                checked={watchedFields.can_input_data}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_input_data", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="can_input_data" className="font-medium">
                  Ввод данных
                </Label>
                <p className="text-sm text-muted-foreground">
                  Возможность добавлять и редактировать данные о школах
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="can_view_reports"
                checked={watchedFields.can_view_reports}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_view_reports", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="can_view_reports" className="font-medium">
                  Просмотр отчетов
                </Label>
                <p className="text-sm text-muted-foreground">
                  Доступ к просмотру отчетов и статистики
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="can_view_analytics"
                checked={watchedFields.can_view_analytics}
                onCheckedChange={(checked) =>
                  handlePermissionChange(
                    "can_view_analytics",
                    checked as boolean
                  )
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="can_view_analytics" className="font-medium">
                  Просмотр аналитики
                </Label>
                <p className="text-sm text-muted-foreground">
                  Доступ к аналитическим данным и метрикам
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="can_form_rating"
                checked={watchedFields.can_form_rating}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_form_rating", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="can_form_rating" className="font-medium">
                  Формирование рейтинга
                </Label>
                <p className="text-sm text-muted-foreground">
                  Права на создание и изменение рейтингов школ
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Очистить
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Создание..." : "Создать роль"}
        </Button>
      </div>
    </form>
  );
}
