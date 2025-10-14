"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolFeature } from "@/types/schools-map";

interface SchoolStatsProps {
  filteredSchools: SchoolFeature[];
}

export default function SchoolStats({ filteredSchools }: SchoolStatsProps) {
  // Анализируем школы по рейтингам или другим критериям
  const analyzeSchools = () => {
    const greenSchools: SchoolFeature[] = [];
    const yellowSchools: SchoolFeature[] = [];
    const redSchools: SchoolFeature[] = [];

    // Отладочный анализ рейтингов
    const ratings = filteredSchools
      .map((s) => s.properties.gis_rating)
      .filter((r) => r !== null);
    console.log("📊 Rating analysis:", {
      totalSchools: filteredSchools.length,
      ratingsCount: ratings.length,
      minRating: Math.min(...ratings),
      maxRating: Math.max(...ratings),
      avgRating: ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0,
      sampleRatings: ratings.slice(0, 10),
    });

    filteredSchools.forEach((school) => {
      const rating = school.properties.gis_rating;

      if (!rating) {
        redSchools.push(school); // Школы без рейтинга считаем красными
      } else {
        // Нормализуем рейтинг к значению от 0 до 100 (та же логика что в паспорте)
        let normalizedRating: number;

        if (rating < 0.1) {
          normalizedRating = rating * 2000; // 0.04 * 2000 = 80%
        } else if (rating <= 1) {
          normalizedRating = rating * 100; // Обычные доли
        } else if (rating <= 100) {
          normalizedRating = rating; // Уже в процентах
        } else {
          normalizedRating = Math.min(rating / 10, 100); // Масштабируем вниз
        }

        // Ограничиваем диапазон 0-100%
        normalizedRating = Math.max(0, Math.min(100, normalizedRating));
        if (normalizedRating >= 86) {
          greenSchools.push(school); // Рейтинг >= 80%
        } else if (normalizedRating >= 50) {
          yellowSchools.push(school); // Рейтинг 60-79%
        } else {
          redSchools.push(school); // Рейтинг < 60%
        }
      }
    });

    return {
      green: greenSchools,
      yellow: yellowSchools,
      red: redSchools,
    };
  };

  const stats = analyzeSchools();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          Распределение школ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
            <span className="text-sm text-gray-700">Высокий рейтинг</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.green.length} школ
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 flex-shrink-0"></div>
            <span className="text-sm text-gray-700">Средний рейтинг</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.yellow.length} школ
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
            <span className="text-sm text-gray-700">Низкий рейтинг</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.red.length} школ
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Всего:</span>
            <span className="text-sm font-bold text-gray-900">
              {filteredSchools.length} школ
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
