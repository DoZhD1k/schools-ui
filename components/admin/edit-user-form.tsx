/**
 * Edit User Form
 * Форма редактирования пользователя
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";

import { adminApiService } from "@/services/admin-api.service";
import { User, Role } from "@/services/admin-api.service";

interface EditUserFormProps {
  user: User;
  roles: Role[];
  onSuccess: () => void;
}

export function EditUserForm({ user, roles, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    patronymic: user.patronymic || "",
    birth_date: user.birth_date || "",
    position: user.position,
    role: user.role,
    school: user.school || undefined,
    is_active: user.is_active,
  });

  const selectedRole = roles.find((role) => role.id === formData.role);
  const isAdminRole = selectedRole?.name === "Администратор";

  const handleInputChange = (
    field: string,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: Record<string, unknown> = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        position: formData.position,
        role: formData.role,
        is_active: formData.is_active,
      };

      // Добавляем опциональные поля только если они заполнены
      if (formData.patronymic) {
        updateData.patronymic = formData.patronymic;
      }

      if (formData.birth_date) {
        updateData.birth_date = formData.birth_date;
      }

      // Для администраторов school = null, для других ролей - может быть указана
      if (!isAdminRole && formData.school) {
        updateData.school = formData.school;
      }

      const updatedUser = await adminApiService.updateUser(user.id, updateData);
      toast.success("Пользователь обновлен", {
        description: `Данные пользователя ${formData.first_name} ${formData.last_name} успешно обновлены`,
      });
      onSuccess();
    } catch (error) {
      toast.error("Ошибка обновления пользователя", {
        description:
          error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Email */}
        <div className="col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        {/* Имя */}
        <div>
          <Label htmlFor="first_name">Имя *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            placeholder="Иван"
          />
        </div>

        {/* Фамилия */}
        <div>
          <Label htmlFor="last_name">Фамилия *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            placeholder="Иванов"
          />
        </div>

        {/* Отчество */}
        <div>
          <Label htmlFor="patronymic">Отчество</Label>
          <Input
            id="patronymic"
            value={formData.patronymic}
            onChange={(e) => handleInputChange("patronymic", e.target.value)}
            placeholder="Иванович"
          />
        </div>

        {/* Дата рождения */}
        <div>
          <Label htmlFor="birth_date">Дата рождения</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange("birth_date", e.target.value)}
          />
        </div>

        {/* Должность */}
        <div className="col-span-2">
          <Label htmlFor="position">Должность *</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            placeholder="Директор"
          />
        </div>

        {/* Роль */}
        <div>
          <Label>Роль *</Label>
          <Select
            value={formData.role.toString()}
            onValueChange={(value) =>
              handleInputChange("role", parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Школа (только для не-администраторов) */}
        {!isAdminRole && (
          <div>
            <Label htmlFor="school">Школа</Label>
            <Input
              id="school"
              type="number"
              value={formData.school || ""}
              onChange={(e) =>
                handleInputChange(
                  "school",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="ID школы"
            />
          </div>
        )}

        {/* Активность */}
        <div className="flex items-center space-x-2 col-span-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              handleInputChange("is_active", checked === true)
            }
          />
          <Label htmlFor="is_active">Активный пользователь</Label>
        </div>
      </div>

      {/* Права выбранной роли */}
      {selectedRole && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <h4 className="font-medium mb-2">
            Права роли &ldquo;{selectedRole.name}&rdquo;:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedRole.can_input_data ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Ввод данных</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedRole.can_view_reports ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Просмотр отчетов</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedRole.can_view_analytics
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              <span>Просмотр аналитики</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedRole.can_form_rating ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Формирование рейтинга</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  );
}
