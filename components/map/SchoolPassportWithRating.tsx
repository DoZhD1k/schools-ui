"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School } from "@/types/schools";
import { School as SchoolIcon, MapPin, Users, User, Phone } from "lucide-react";

interface SchoolPassportWithRatingProps {
  selectedSchool?: School | null;
}

export default function SchoolPassportWithRating({
  selectedSchool,
}: SchoolPassportWithRatingProps) {
  if (!selectedSchool) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SchoolIcon className="h-5 w-5" />
            Паспорт объекта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <SchoolIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Выберите школу на карте</p>
            <p className="text-xs text-gray-400">
              Кликните на точку школы, чтобы увидеть информацию
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const school = selectedSchool;
  const ratingPercentage = school.currentRating;

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
          <SchoolIcon className="h-5 w-5" />
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
              {Math.round(ratingPercentage)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Общий рейтинг школы</p>
          </div>
        )}

        {/* Основная информация */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {school.nameRu}
            </h3>
            {school.organizationType && (
              <Badge variant="outline" className="text-xs">
                {school.organizationType}
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
                <p className="text-sm text-gray-600">
                  {school.district.nameRu}
                </p>
              </div>
            </div>
          )}

          {/* Адрес */}
          {school.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Адрес:
                </span>
                <p className="text-sm text-gray-600">{school.address}</p>
              </div>
            </div>
          )}

          {/* Директор */}
          {school.director && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Директор:
                </span>
                <p className="text-sm text-gray-600">{school.director}</p>
              </div>
            </div>
          )}

          {/* Количество учащихся */}
          {school.currentStudents && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Количество учащихся:
                </span>
                <p className="text-sm text-gray-600">
                  {school.currentStudents.toLocaleString()} чел.
                </p>
              </div>
            </div>
          )}

          {/* Проектная мощность */}
          {school.capacity && (
            <div className="flex items-start gap-2">
              <SchoolIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Проектная мощность:
                </span>
                <p className="text-sm text-gray-600">
                  {school.capacity.toLocaleString()} чел.
                </p>
              </div>
            </div>
          )}

          {/* Телефон */}
          {school.phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Телефон:
                </span>
                <p className="text-sm text-gray-600">{school.phone}</p>
              </div>
            </div>
          )}

          {/* Год основания */}
          {school.foundedYear && (
            <div className="flex items-start gap-2">
              <SchoolIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Год основания:
                </span>
                <p className="text-sm text-gray-600">{school.foundedYear}</p>
              </div>
            </div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">ID: {school.id}</p>
          {school.ratingZone && (
            <div className="mt-1">
              <span className="text-xs text-gray-500">Зона: </span>
              <Badge
                variant={
                  school.ratingZone === "green"
                    ? "default"
                    : school.ratingZone === "yellow"
                    ? "secondary"
                    : "destructive"
                }
                className="text-xs"
              >
                {school.ratingZone === "green"
                  ? "Зеленая"
                  : school.ratingZone === "yellow"
                  ? "Желтая"
                  : "Красная"}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
