"use client";

import React, { useEffect, useState } from "react";
import {
  Eye,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CombinedSchool } from "./school-card";

interface AnalyzeItem {
  id: number;
  academic_results_rating: number;
  pedagogical_potential_rating: number;
  safety_climate_rating: number;
  infrastructure_rating: number;
  graduate_success_rating: number;
  penalty_rating: number;
  digital_rating: number;
}

interface SchoolApiItem {
  id: number;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  district: string;
  gis_rating: number | null;
}

interface SchoolsTableProps {
  onRowClick: (school: CombinedSchool) => void;
  selectedDistrict?: string;
  searchQuery?: string;
  onView: (school: CombinedSchool) => void;
  schools: CombinedSchool[];
  setSchools: React.Dispatch<React.SetStateAction<CombinedSchool[]>>;
}

export const SchoolsTable = ({
  onRowClick,
  selectedDistrict,
  searchQuery,
  onView,
  schools,
  setSchools,
}: SchoolsTableProps) => {
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const getColoredPercentage = (value?: number) => {
    if (value === undefined || value === null)
      return <span className={`px-2 py-1 text-gray-600`}>-</span>;

    let colorClass = "bg-red-400"; // default: low
    if (value >= 80) colorClass = "bg-green-400"; // excellent
    else if (value >= 50) colorClass = "bg-yellow-400"; // medium

    return (
      <span className={`${colorClass} font-semibold px-2 py-1 rounded-md`}>
        {value.toFixed(1)}%
      </span>
    );
  };

  const getColoredRating = (rating: number | null) => {
    if (rating === null || rating === undefined) return "—";
    if (rating >= 4.3)
      return (
        <span className="bg-green-400 font-semibold px-2 py-1 rounded-md">
          {rating}
        </span>
      );
    if (rating >= 3.0)
      return (
        <span className="bg-yellow-400 font-semibold px-2 py-1 rounded-md">
          {rating}
        </span>
      );
    return (
      <span className="bg-red-400 font-semibold px-2 py-1 rounded-md">
        {rating}
      </span>
    );
  };

  useEffect(() => {
    const districtFilter =
      !selectedDistrict || selectedDistrict === "all" ? "" : selectedDistrict;

    const fetchData = async () => {
      try {
        const offset = (currentPage - 1) * itemsPerPage;

        const [res1, res2] = await Promise.all([
          fetch(
            `https://admin.smartalmaty.kz/api/v1/institutions-monitoring/schools/?limit=${itemsPerPage}&offset=${offset}&district=${districtFilter}&search=${searchQuery}`
          ),
          fetch(
            `https://admin.smartalmaty.kz/api/v1/institutions-monitoring/schools/analyze/?limit=${itemsPerPage}&offset=${offset}&district=${districtFilter}`
          ),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const analyzeMap = new Map<number, AnalyzeItem>();
        data2.results.forEach((a: AnalyzeItem) => analyzeMap.set(a.id, a));

        const merged: CombinedSchool[] = data1.results.map(
          (s: SchoolApiItem) => ({
            ...s,
            ...(analyzeMap.get(s.id) ?? {}),
          })
        );

        setSchools(merged);
        setTotalCount(data1.count);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      }
    };

    fetchData();
  }, [currentPage, selectedDistrict, searchQuery, setSchools]);

  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
        <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
        <div className="relative overflow-x-auto overflow-y-auto max-h-[600px] ">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200/50">
                <th className="text-left p-6 text-sm font-semibold text-slate-700">
                  Наименование школы
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                  Общий рейтинг ↓
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  За 1-четверть
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  За 2-четверть
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  За 3-четверть
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Качество знаний
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Динамика результатов
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Квалификация педагогов
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Оснащенность
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Развитие талантов
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Профилактика нарушений
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Инклюзивное образование
                </th>
                <th className="text-center p-6 text-sm font-semibold text-slate-700">
                  Просмотр паспорта
                </th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, index) => (
                <tr
                  key={school.id}
                  className={`border-b border-slate-200/30 hover:bg-slate-50/50 transition-colors ${
                    index % 2 === 0 ? "bg-slate-25/30" : ""
                  }`}
                  onClick={() => onRowClick(school)}
                >
                  <td className="p-6">
                    <div>
                      <div className="font-semibold text-slate-800 mb-1">
                        {school.name_of_the_organization}
                      </div>
                      <div className="text-sm text-slate-600">
                        {school.types_of_educational_institutions}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {school.district}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.digital_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(70)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(75)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(80)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.academic_results_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.graduate_success_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.pedagogical_potential_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.infrastructure_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(85)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(school.penalty_rating)}
                  </td>
                  <td className="p-6 text-center">
                    {getColoredPercentage(90)}
                  </td>
                  <td className="p-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(school);
                      }}
                      className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Паспорт
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-b-0 border-slate-200 rounded-b-lg">
        <div className="flex items-center text-sm text-slate-700">
          Показано {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, totalCount)} из {totalCount}{" "}
          школ
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
