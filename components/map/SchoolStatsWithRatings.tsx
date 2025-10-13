"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School } from "@/types/schools";

interface SchoolStatsWithRatingsProps {
  schools: School[];
}

export default function SchoolStatsWithRatings({
  schools,
}: SchoolStatsWithRatingsProps) {
  // Подсчитываем школы по зонам рейтинга
  const schoolsByZone = schools.reduce(
    (acc, school) => {
      if (school.currentRating) {
        if (school.currentRating >= 86) {
          acc.green++; // Зеленая зона (86%-100%)
        } else if (school.currentRating >= 50) {
          acc.yellow++; // Желтая зона (50%-85%)
        } else if (school.currentRating >= 5) {
          acc.red++; // Красная зона (5%-49%)
        } else {
          acc.noRating++; // Очень низкий рейтинг (< 5%)
        }
      } else {
        acc.noRating++;
      }
      return acc;
    },
    { green: 0, yellow: 0, red: 0, noRating: 0 }
  );

  const totalSchoolsWithRating =
    schoolsByZone.green + schoolsByZone.yellow + schoolsByZone.red;
  const totalSchools = schools.length;

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            Статистика рейтингов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Зеленая зона (86%-100%) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">
                  Зеленая зона (86%-100%)
                </span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {schoolsByZone.green} школ
              </Badge>
            </div>

            {/* Желтая зона (50%-85%) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">
                  Желтая зона (50%-85%)
                </span>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {schoolsByZone.yellow} школ
              </Badge>
            </div>

            {/* Красная зона (5%-49%) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">
                  Красная зона (5%-49%)
                </span>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {schoolsByZone.red} школ
              </Badge>
            </div>

            {/* Без рейтинга */}
            {schoolsByZone.noRating > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm font-medium">Без рейтинга</span>
                </div>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  {schoolsByZone.noRating} школ
                </Badge>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Всего школ:</span>
              <span className="font-semibold">{totalSchools}</span>
            </div>
            {schoolsByZone.noRating > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">С рейтингом:</span>
                <span className="font-semibold">{totalSchoolsWithRating}</span>
              </div>
            )}
          </div>

          {/* Средний рейтинг */}
          {totalSchoolsWithRating > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-center">
                {(() => {
                  const averageRating =
                    schools
                      .filter((s) => s.currentRating)
                      .reduce((sum, s) => sum + (s.currentRating || 0), 0) /
                    totalSchoolsWithRating;

                  return (
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(averageRating)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Средний рейтинг
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
