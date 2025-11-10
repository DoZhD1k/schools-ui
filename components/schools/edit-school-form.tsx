"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { School } from "@/types/schools";
import { IntegratedSchoolsService } from "@/services/integrated-schools.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X, Building2, User, MapPin } from "lucide-react";

interface EditSchoolFormProps {
  schoolId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedSchool: School) => void;
}

interface EditableSchoolData {
  nameRu: string;
  nameKz: string;
  director: string;
  address: string;
  phone: string;
  capacity: number;
  currentStudents: number;
  organizationType: string;
  foundedYear: number;
  commissionedYear?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const EditSchoolForm: React.FC<EditSchoolFormProps> = ({
  schoolId,
  isOpen,
  onClose,
  onSave,
}) => {
  const permissions = usePermissions();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalSchool, setOriginalSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<EditableSchoolData>({
    nameRu: "",
    nameKz: "",
    director: "",
    address: "",
    phone: "",
    capacity: 0,
    currentStudents: 0,
    organizationType: "",
    foundedYear: 2000,
    commissionedYear: undefined,
    coordinates: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const organizationTypes = [
    "Общеобразовательная школа",
    "Гимназия",
    "Лицей",
    "Школа-интернат",
    "Специализированная школа",
    "Международная школа",
    "Частная школа",
  ];

  const loadSchoolData = useCallback(async () => {
    setLoading(true);
    try {
      const school = await IntegratedSchoolsService.getSchool(schoolId);
      if (!school) {
        throw new Error("School not found");
      }
      setOriginalSchool(school);
      setFormData({
        nameRu: school.nameRu,
        nameKz: school.nameKz,
        director: school.director,
        address: school.address,
        phone: school.phone || "",
        capacity: school.capacity,
        currentStudents: school.currentStudents,
        organizationType: school.organizationType,
        foundedYear: school.foundedYear,
        commissionedYear: school.commissionedYear,
        coordinates: school.coordinates,
      });
      setErrors({});
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные школы",
        variant: "destructive",
      });
      console.error("Error loading school data:", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  useEffect(() => {
    if (isOpen && schoolId) {
      loadSchoolData();
    }
  }, [isOpen, schoolId, loadSchoolData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameRu.trim()) {
      newErrors.nameRu = "Название на русском обязательно";
    }

    if (!formData.nameKz.trim()) {
      newErrors.nameKz = "Название на казахском обязательно";
    }

    if (!formData.director.trim()) {
      newErrors.director = "ФИО директора обязательно";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Адрес обязателен";
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = "Проектная мощность должна быть больше 0";
    }

    if (formData.currentStudents < 0) {
      newErrors.currentStudents =
        "Количество учащихся не может быть отрицательным";
    }

    if (formData.currentStudents > formData.capacity) {
      newErrors.currentStudents =
        "Количество учащихся не может превышать проектную мощность";
    }

    if (
      formData.foundedYear < 1900 ||
      formData.foundedYear > new Date().getFullYear()
    ) {
      newErrors.foundedYear = "Некорректный год основания";
    }

    if (
      formData.commissionedYear &&
      (formData.commissionedYear < formData.foundedYear ||
        formData.commissionedYear > new Date().getFullYear())
    ) {
      newErrors.commissionedYear = "Некорректный год ввода в эксплуатацию";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, исправьте ошибки в форме",
        variant: "destructive",
      });
      return;
    }

    // Проверяем права доступа
    if (
      !permissions ||
      (!permissions.isAdmin() && !permissions.canEditSchoolData(schoolId))
    ) {
      toast({
        title: "Нет прав доступа",
        description: "У вас нет прав на редактирование данной школы",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updatedSchool: School = {
        ...originalSchool!,
        ...formData,
      };

      await IntegratedSchoolsService.updateSchool(schoolId, updatedSchool);

      toast({
        title: "Успешно сохранено",
        description: "Данные школы обновлены",
      });

      if (onSave) {
        onSave(updatedSchool);
      }

      onClose();
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
      console.error("Error saving school data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof EditableSchoolData,
    value: string | number | { lat: number; lng: number } | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const canEdit =
    permissions?.isAdmin() || permissions?.canEditSchoolData(schoolId);

  if (!canEdit) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-2" />
              Нет доступа
            </DialogTitle>
            <DialogDescription>
              У вас нет прав на редактирование данной школы.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Редактирование школы
          </DialogTitle>
          <DialogDescription>
            Изменение основных данных образовательного учреждения
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка данных...</span>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Основная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Основная информация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameRu">Название (рус) *</Label>
                  <Input
                    id="nameRu"
                    value={formData.nameRu}
                    onChange={(e) =>
                      handleInputChange("nameRu", e.target.value)
                    }
                    className={errors.nameRu ? "border-red-500" : ""}
                  />
                  {errors.nameRu && (
                    <p className="text-sm text-red-500">{errors.nameRu}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameKz">Название (каз) *</Label>
                  <Input
                    id="nameKz"
                    value={formData.nameKz}
                    onChange={(e) =>
                      handleInputChange("nameKz", e.target.value)
                    }
                    className={errors.nameKz ? "border-red-500" : ""}
                  />
                  {errors.nameKz && (
                    <p className="text-sm text-red-500">{errors.nameKz}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationType">Тип организации</Label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) =>
                    handleInputChange("organizationType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип организации" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Руководство и контакты */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Руководство и контакты
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">ФИО директора *</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) =>
                      handleInputChange("director", e.target.value)
                    }
                    className={errors.director ? "border-red-500" : ""}
                  />
                  {errors.director && (
                    <p className="text-sm text-red-500">{errors.director}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+7 (777) 123-45-67"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                  rows={2}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Характеристики */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Характеристики</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Проектная мощность *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange(
                        "capacity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={errors.capacity ? "border-red-500" : ""}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-500">{errors.capacity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStudents">
                    Текущее количество учащихся *
                  </Label>
                  <Input
                    id="currentStudents"
                    type="number"
                    value={formData.currentStudents}
                    onChange={(e) =>
                      handleInputChange(
                        "currentStudents",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={errors.currentStudents ? "border-red-500" : ""}
                  />
                  {errors.currentStudents && (
                    <p className="text-sm text-red-500">
                      {errors.currentStudents}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Год основания *</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) =>
                      handleInputChange(
                        "foundedYear",
                        parseInt(e.target.value) || 2000
                      )
                    }
                    className={errors.foundedYear ? "border-red-500" : ""}
                  />
                  {errors.foundedYear && (
                    <p className="text-sm text-red-500">{errors.foundedYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionedYear">
                    Год ввода в эксплуатацию
                  </Label>
                  <Input
                    id="commissionedYear"
                    type="number"
                    value={formData.commissionedYear || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "commissionedYear",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className={errors.commissionedYear ? "border-red-500" : ""}
                  />
                  {errors.commissionedYear && (
                    <p className="text-sm text-red-500">
                      {errors.commissionedYear}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Координаты */}
            {formData.coordinates && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Координаты
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Широта</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.coordinates.lat}
                      onChange={(e) =>
                        handleInputChange("coordinates", {
                          lat: parseFloat(e.target.value) || 0,
                          lng: formData.coordinates?.lng || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lng">Долгота</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.coordinates.lng}
                      onChange={(e) =>
                        handleInputChange("coordinates", {
                          lat: formData.coordinates?.lat || 0,
                          lng: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Статус школы */}
            {originalSchool && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Текущий статус</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Рейтинг: {originalSchool.currentRating}%
                  </Badge>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor:
                        originalSchool.ratingZone === "green"
                          ? "#22c55e"
                          : originalSchool.ratingZone === "yellow"
                          ? "#eab308"
                          : "#ef4444",
                      color: "white",
                    }}
                  >
                    {originalSchool.ratingZone === "green"
                      ? "Зеленая зона"
                      : originalSchool.ratingZone === "yellow"
                      ? "Желтая зона"
                      : "Красная зона"}
                  </Badge>
                  <Badge variant="outline">
                    Район: {originalSchool.district.nameRu}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolForm;
