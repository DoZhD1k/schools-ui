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
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Building2, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { School, DistrictStats } from "@/types/schools";
import { getRatingZoneColor } from "@/lib/rating-utils";

interface DistrictSchoolsChartProps {
  districtStats: DistrictStats[];
  schools: School[];
  onExport: (schools: School[], title: string) => void;
}

export default function DistrictSchoolsChart({
  districtStats,
  schools,
  onExport,
}: DistrictSchoolsChartProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<School[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  // Подготовка данных для графика
  const chartData = districtStats.map((stat) => ({
    name: stat.district.nameRu,
    value: stat.totalSchools,
    districtId: stat.district.id,
    fullName: stat.district.nameRu,
  }));

  const handleBarClick = (data: {
    name: string;
    value: number;
    districtId: string;
    fullName: string;
  }) => {
    const districtSchools = schools.filter(
      (school) => school.districtId === data.districtId
    );

    setModalTitle(
      `Список организаций образования по району "${data.fullName}"`
    );
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
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{`${label}`}</p>
          <p className="text-blue-600">
            {`Количество школ: ${payload[0].value}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Нажмите для просмотра списка
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
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-lg">
              <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            Общее количество школ по районам
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
                <Bar
                  dataKey="value"
                  onClick={handleBarClick}
                  className="cursor-pointer"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#blueGradient-${index})`}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
                <defs>
                  {chartData.map((_, index) => (
                    <linearGradient
                      key={`blueGradient-${index}`}
                      id={`blueGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно со списком школ района */}
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
              <div className="space-y-1">
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Найдено школ:{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {modalData.length}
                  </span>
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-600">
                    Зеленая зона:{" "}
                    {modalData.filter((s) => s.ratingZone === "green").length}
                  </span>
                  <span className="text-amber-600">
                    Желтая зона:{" "}
                    {modalData.filter((s) => s.ratingZone === "yellow").length}
                  </span>
                  <span className="text-red-600">
                    Красная зона:{" "}
                    {modalData.filter((s) => s.ratingZone === "red").length}
                  </span>
                </div>
              </div>
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
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-32">
                      Тип организации
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-32">
                      Собственность
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-32">
                      Ведомство
                    </th>
                    <th className="text-left p-2 font-bold text-slate-700 dark:text-slate-300 w-24">
                      Учащихся
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
                          <div className="mt-1">
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
                          </div>
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
                      <td className="p-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                        {school.organizationType}
                      </td>
                      <td className="p-2 text-xs text-slate-600 dark:text-slate-400">
                        Коммунальная
                      </td>
                      <td className="p-2 text-xs text-slate-600 dark:text-slate-400">
                        МИО
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        {school.currentStudents}
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
