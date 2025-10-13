"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SchoolFeature } from "@/types/schools-map";
import { School, MapPin, Users, User } from "lucide-react";

interface SchoolPassportProps {
  selectedSchool?: SchoolFeature | null;
}

export default function SchoolPassport({
  selectedSchool,
}: SchoolPassportProps) {
  if (!selectedSchool) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <School className="h-5 w-5" />
            Паспорт объекта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <School className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Выберите школу на карте</p>
            <p className="text-xs text-gray-400">
              Кликните на точку школы, чтобы увидеть информацию
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const school = selectedSchool.properties;
  const rating = school.gis_rating;

  // Отладочный лог для проверки рейтинга
  console.log("📊 School rating debug:", {
    schoolName: school.name_of_the_organization,
    rawRating: rating,
    ratingType: typeof rating,
    ratingGreaterThan1: rating ? rating > 1 : false,
  });

  // Простая логика для определения рейтинга
  let ratingPercentage: number | null = null;

  if (rating) {
    // Если значение очень маленькое (меньше 0.1), масштабируем в 20 раз
    // Это может быть рейтинг по 5-балльной шкале, переведенный в доли
    if (rating < 0.1) {
      ratingPercentage = Math.round(rating * 2000); // 0.04 * 2000 = 80%
    } else if (rating <= 1) {
      ratingPercentage = Math.round(rating * 100); // Обычные доли
    } else if (rating <= 100) {
      ratingPercentage = Math.round(rating); // Уже в процентах
    } else {
      ratingPercentage = Math.min(Math.round(rating / 10), 100); // Масштабируем вниз
    }

    // Ограничиваем диапазон 0-100%
    ratingPercentage = Math.max(0, Math.min(100, ratingPercentage));

    console.log("📊 Calculated rating:", {
      original: rating,
      calculated: ratingPercentage,
    });
  }

  // Определяем цвет рейтинга
  const getRatingColor = (percentage: number | null) => {
    if (!percentage) return "bg-gray-100 text-gray-600";
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <School className="h-5 w-5" />
          Паспорт объекта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Рейтинг */}
        {ratingPercentage && (
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getRatingColor(
                ratingPercentage
              )}`}
            >
              {ratingPercentage}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Средний рейтинг школы</p>
          </div>
        )}

        {/* Основная информация */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {school.name_of_the_organization}
            </h3>
            {school.types_of_educational_institutions && (
              <Badge variant="outline" className="text-xs">
                {school.types_of_educational_institutions}
              </Badge>
            )}
          </div>

          {/* Район */}
          {school.district && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Район:
                </span>
                <p className="text-sm text-gray-600">{school.district}</p>
              </div>
            </div>
          )}

          {/* Форма собственности */}
          {school.form_of_ownership && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Форма собственности:
                </span>
                <p className="text-sm text-gray-600">
                  {school.form_of_ownership}
                </p>
              </div>
            </div>
          )}

          {/* Ведомственная принадлежность */}
          {school.departmental_affiliation && (
            <div className="flex items-start gap-2">
              <School className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Ведомство:
                </span>
                <p className="text-sm text-gray-600">
                  {school.departmental_affiliation}
                </p>
              </div>
            </div>
          )}

          {/* Количество учащихся */}
          {school.contingency_filter && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Количество учащихся:
                </span>
                <p className="text-sm text-gray-600">
                  {school.contingency_filter.toLocaleString()} чел.
                </p>
              </div>
            </div>
          )}

          {/* Группа школы */}
          {school.group_of_school && (
            <div className="flex items-start gap-2">
              <School className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Группа школы:
                </span>
                <p className="text-sm text-gray-600">
                  {school.group_of_school}
                </p>
              </div>
            </div>
          )}

          {/* Статус закрытия */}
          {school.is_closed_sign && (
            <div className="mt-3">
              <Badge variant="destructive">Школа закрыта</Badge>
            </div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">ID: {school.id}</p>
          {school.region && (
            <p className="text-xs text-gray-500">Регион: {school.region}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
