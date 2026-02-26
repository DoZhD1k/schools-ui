"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Target, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { School, RatingIndicator } from "@/types/schools";
import { getRatingZoneColor } from "@/lib/rating-utils";

interface RatingIndicatorsProps {
  schools: School[];
  onExport: (schools: School[], title: string) => void;
}

export default function RatingIndicators({
  schools,
  onExport,
}: RatingIndicatorsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<School[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  // Подготовка данных для круговых индикаторов
  const totalSchools = schools.length;
  const greenZone = schools.filter((s) => s.ratingZone === "green").length;
  const yellowZone = schools.filter((s) => s.ratingZone === "yellow").length;
  const redZone = schools.filter((s) => s.ratingZone === "red").length;

  const indicators: RatingIndicator[] = [
    {
      zone: "green",
      count: greenZone,
      percentage:
        totalSchools > 0 ? Math.round((greenZone / totalSchools) * 100) : 0,
      color: "#22c55e",
      label: "86% - 100%",
    },
    {
      zone: "yellow",
      count: yellowZone,
      percentage:
        totalSchools > 0 ? Math.round((yellowZone / totalSchools) * 100) : 0,
      color: "#eab308",
      label: "50% - 85%",
    },
    {
      zone: "red",
      count: redZone,
      percentage:
        totalSchools > 0 ? Math.round((redZone / totalSchools) * 100) : 0,
      color: "#ef4444",
      label: "5% - 49%",
    },
  ];

  // Данные для круговой диаграммы
  const pieData = indicators.map((indicator) => ({
    name: indicator.label,
    value: indicator.count,
    color: indicator.color,
    zone: indicator.zone,
    percentage: indicator.percentage,
  }));

  const handleIndicatorClick = (zone: "green" | "yellow" | "red") => {
    const zoneSchools = schools.filter((school) => school.ratingZone === zone);
    const zoneNames = {
      green: "86% - 100%",
      yellow: "50% - 85%",
      red: "5% - 49%",
    };

    setModalTitle(`Список школ по шкале "${zoneNames[zone]}"`);
    setModalData(zoneSchools);
    setModalOpen(true);
  };

  const handleExport = () => {
    onExport(modalData, modalTitle);
  };

  // Кастомный тултип для круговой диаграммы
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload: {
        zone: string;
        percentage: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-blue-600">{`Количество: ${data.value}`}</p>
          <p className="text-emerald-600">{`Процент: ${data.payload.percentage}%`}</p>
          <p className="text-xs text-slate-500 mt-1">Нажмите для просмотра</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Круговые индикаторы */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-xl font-bold text-slate-900 dark:text-white">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg">
                <Target className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              Круговые индикаторы рейтинга
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {indicators.map((indicator) => (
                <div
                  key={indicator.zone}
                  className="text-center cursor-pointer transition-transform md:hover:scale-105"
                  onClick={() => handleIndicatorClick(indicator.zone)}
                >
                  <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-2 md:mb-3">
                    <svg
                      className="w-16 h-16 md:w-24 md:h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      {/* Фоновый круг */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                      />
                      {/* Прогресс круг */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={indicator.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          (indicator.percentage * 251.2) / 100
                        } 251.2`}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-sm md:text-xl font-bold ${
                          indicator.zone === "green"
                            ? "text-green-500"
                            : indicator.zone === "yellow"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {indicator.percentage}%
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-xs md:text-base text-slate-900 dark:text-white mb-0.5 md:mb-1">
                    {indicator.label}
                  </h3>
                  <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-400">
                    {indicator.count} школ
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Круговая диаграмма */}
        <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-base md:text-xl font-bold text-slate-900 dark:text-white">
              <div className="p-1.5 md:p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-lg">
                <Target className="h-4 w-4 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Распределение школ по зонам
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="p-2 md:p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) =>
                      handleIndicatorClick(
                        data.zone as "green" | "yellow" | "red",
                      )
                    }
                    className="cursor-pointer"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 md:gap-4 mt-3 md:mt-4">
                {indicators.map((indicator) => (
                  <div
                    key={indicator.zone}
                    className="flex items-center gap-1.5 md:gap-2"
                  >
                    <div
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                        indicator.zone === "green"
                          ? "bg-green-500"
                          : indicator.zone === "yellow"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
                      {indicator.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно со списком школ по шкале */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] md:min-w-[150vh] max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-3 md:pb-4">
            <DialogTitle className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {modalTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Статистика и кнопка экспорта */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 p-3 md:p-4 rounded-lg border border-slate-200/60 dark:border-slate-600/60">
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-semibold">
                Найдено школ:{" "}
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {modalData.length}
                </span>
              </p>
              <Button
                onClick={handleExport}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                EXPORT
              </Button>
            </div>

            {/* Таблица школ */}
            <div className="overflow-x-auto bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
              <table className="w-full table-auto min-w-[700px]">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      №
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Наименование школы
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Район
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Адрес
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Текущий рейтинг
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      За 3-четверть
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      За 2-четверть
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      За 1-четверть
                    </th>
                    <th className="text-left p-4 font-bold text-slate-700 dark:text-slate-300">
                      Общий годовой рейтинг
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((school, index) => (
                    <tr
                      key={school.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                    >
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {school.nameRu}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {school.organizationType}
                        </p>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {school.district.nameRu}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
                            <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{school.address}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: getRatingZoneColor(
                              school.ratingZone,
                            ),
                          }}
                          className="text-white font-bold shadow-lg"
                        >
                          {school.currentRating}%
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900 rounded-lg font-bold text-purple-700 dark:text-purple-300">
                          {school.q3Rating}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 rounded-lg font-bold text-emerald-700 dark:text-emerald-300">
                          {school.q2Rating}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg font-bold text-blue-700 dark:text-blue-300">
                          {school.q1Rating}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 rounded-lg font-bold text-amber-700 dark:text-amber-300">
                          {school.yearlyRating}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
