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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { School, DistrictStats } from "@/types/schools";
import { getRatingZoneColor } from "@/lib/rating-utils";

interface RatingZonesChartProps {
  districtStats: DistrictStats[];
  schools: School[];
  onExport: (schools: School[], title: string) => void;
}

export default function RatingZonesChart({
  districtStats,
  schools,
  onExport,
}: RatingZonesChartProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<School[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  // Подготовка данных для графика
  const chartData = districtStats.map((stat) => ({
    name: stat.district.nameRu,
    green: stat.greenZone,
    yellow: stat.yellowZone,
    red: stat.redZone,
    districtId: stat.district.id,
  }));

  const handleBarClick = (
    data: {
      name: string;
      green: number;
      yellow: number;
      red: number;
      districtId: string;
    },
    zone: "green" | "yellow" | "red"
  ) => {
    const districtSchools = schools.filter(
      (school) =>
        school.districtId === data.districtId && school.ratingZone === zone
    );

    const zoneNames = {
      green: "зеленой зоне (86%-100%)",
      yellow: "желтой зоне (50%-85%)",
      red: "красной зоне (5%-49%)",
    };

    setModalTitle(`Список школ в ${zoneNames[zone]} по району "${data.name}"`);
    setModalData(districtSchools);
    setModalOpen(true);
  };

  const handleExport = () => {
    onExport(modalData, modalTitle);
  };

  // Кастомный тултип
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{`${label}`}</p>
          {payload.map((entry, index) => {
            const zoneName =
              entry.dataKey === "green"
                ? "Зеленая зона"
                : entry.dataKey === "yellow"
                ? "Желтая зона"
                : "Красная зона";
            const colorClass =
              entry.dataKey === "green"
                ? "text-green-600"
                : entry.dataKey === "yellow"
                ? "text-yellow-600"
                : "text-red-600";
            return (
              <p key={index} className={colorClass}>
                {`${zoneName}: ${entry.value}`}
              </p>
            );
          })}
          <p className="text-xs text-slate-500 mt-1">
            Нажмите на зону для просмотра школ
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            Общее количество школ по рейтингу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  fontWeight="bold"
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="green"
                  stackId="a"
                  fill="#22c55e"
                  name="Зеленая зона (86%-100%)"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(data) => handleBarClick(data, "green")}
                />
                <Bar
                  dataKey="yellow"
                  stackId="a"
                  fill="#eab308"
                  name="Желтая зона (50%-85%)"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(data) => handleBarClick(data, "yellow")}
                />
                <Bar
                  dataKey="red"
                  stackId="a"
                  fill="#ef4444"
                  name="Красная зона (5%-49%)"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(data) => handleBarClick(data, "red")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно со списком школ зоны */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="min-w-[150vh] max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {modalTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Статистика и кнопка экспорта */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 p-4 rounded-lg border border-slate-200/60 dark:border-slate-600/60">
              <p className="text-slate-700 dark:text-slate-300 font-semibold">
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
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
                  <tr className="border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-12">
                      №
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-48">
                      Наименование школы
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-32">
                      Район
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-40">
                      Адрес
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-24">
                      Текущий
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-20">
                      3-чет
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-20">
                      2-чет
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-20">
                      1-чет
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-24">
                      Годовой
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((school, index) => (
                    <tr
                      key={school.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200"
                    >
                      <td className="p-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
                        {index + 1}
                      </td>
                      <td className="p-2">
                        <div className="w-48 overflow-hidden">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm break-words">
                            {school.nameRu}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                            {school.organizationType}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 font-medium text-slate-700 dark:text-slate-300 text-sm">
                        {school.district.nameRu}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                          <div className="p-1 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 dark:from-blue-900 dark:to-emerald-900">
                            <MapPin className="h-2 w-2 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium truncate">
                            {school.address}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: getRatingZoneColor(
                              school.ratingZone
                            ),
                          }}
                          className="text-white font-bold text-xs"
                        >
                          {school.currentRating}%
                        </Badge>
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {school.q3Rating}%
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {school.q2Rating}%
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {school.q1Rating}%
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
