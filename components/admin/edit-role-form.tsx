/**
 * Edit Role Form
 * Форма редактирования роли
 */

"use client";

import { useState, useEffect } from "react";
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

import { adminApiService } from "@/services/admin-api.service";
import { Role } from "@/services/admin-api.service";

interface EditRoleFormData {
  name: string;
  can_input_data: boolean;
  can_view_reports: boolean;
  can_view_analytics: boolean;
  can_form_rating: boolean;
}

interface EditRoleFormProps {
  role: Role;
  onSuccess: () => void;
}

export function EditRoleForm({ role, onSuccess }: EditRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditRoleFormData>({
    defaultValues: {
      name: role.name,
      can_input_data: role.can_input_data,
      can_view_reports: role.can_view_reports,
      can_view_analytics: role.can_view_analytics,
      can_form_rating: role.can_form_rating,
    },
  });

  const watchedFields = watch();

  // Сброс формы при изменении роли
  useEffect(() => {
    reset({
      name: role.name,
      can_input_data: role.can_input_data,
      can_view_reports: role.can_view_reports,
      can_view_analytics: role.can_view_analytics,
      can_form_rating: role.can_form_rating,
    });
  }, [role, reset]);

  const onSubmit = async (data: EditRoleFormData) => {
    setIsLoading(true);

    try {
      const updatedRole = await adminApiService.updateRole(role.id, {
        name: data.name.trim(),
        can_input_data: data.can_input_data,
        can_view_reports: data.can_view_reports,
        can_view_analytics: data.can_view_analytics,
        can_form_rating: data.can_form_rating,
      });

      toast.success("Роль успешно обновлена");
      onSuccess();
    } catch (error) {
      toast.error("Ошибка обновления роли", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }

    setIsLoading(false);
  };

  const handlePermissionChange = (
    permission: keyof Omit<EditRoleFormData, "name">,
    checked: boolean
  ) => {
    setValue(permission, checked, { shouldValidate: true });
  };

  // Проверка изменений
  const hasChanges =
    watchedFields.name !== role.name ||
    watchedFields.can_input_data !== role.can_input_data ||
    watchedFields.can_view_reports !== role.can_view_reports ||
    watchedFields.can_view_analytics !== role.can_view_analytics ||
    watchedFields.can_form_rating !== role.can_form_rating;

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
            Измените права доступа для роли &quot;{role.name}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="edit_can_input_data"
                checked={watchedFields.can_input_data}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_input_data", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="edit_can_input_data" className="font-medium">
                  Ввод данных
                </Label>
                <p className="text-sm text-muted-foreground">
                  Возможность добавлять и редактировать данные о школах
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="edit_can_view_reports"
                checked={watchedFields.can_view_reports}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_view_reports", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="edit_can_view_reports" className="font-medium">
                  Просмотр отчетов
                </Label>
                <p className="text-sm text-muted-foreground">
                  Доступ к просмотру отчетов и статистики
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="edit_can_view_analytics"
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
                <Label
                  htmlFor="edit_can_view_analytics"
                  className="font-medium"
                >
                  Просмотр аналитики
                </Label>
                <p className="text-sm text-muted-foreground">
                  Доступ к аналитическим данным и метрикам
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="edit_can_form_rating"
                checked={watchedFields.can_form_rating}
                onCheckedChange={(checked) =>
                  handlePermissionChange("can_form_rating", checked as boolean)
                }
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="edit_can_form_rating" className="font-medium">
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

      {/* Индикатор изменений */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Внесены изменения. Нажмите &quot;Сохранить&quot;, чтобы применить
            их.
          </p>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            reset({
              name: role.name,
              can_input_data: role.can_input_data,
              can_view_reports: role.can_view_reports,
              can_view_analytics: role.can_view_analytics,
              can_form_rating: role.can_form_rating,
            })
          }
          disabled={isLoading || !hasChanges}
        >
          Отменить
        </Button>
        <Button type="submit" disabled={isLoading || !hasChanges}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
