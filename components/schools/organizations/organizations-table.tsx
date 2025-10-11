"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Eye, MapPin, Phone, User } from "lucide-react";
import { OrganizationData } from "./organization-card";

interface OrganizationsTableProps {
  organizations: OrganizationData[];
  onView: (org: OrganizationData) => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const OrganizationsTable = ({
  organizations,
  onView,
  onSort,
  sortBy,
  sortOrder,
}: OrganizationsTableProps) => {
  const getRatingZoneColor = (zone: string) => {
    switch (zone) {
      case "green":
        return "bg-emerald-500";
      case "yellow":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getZoneName = (zone: string) => {
    switch (zone) {
      case "green":
        return "Зеленая зона";
      case "yellow":
        return "Желтая зона";
      case "red":
        return "Красная зона";
      default:
        return "Неизвестно";
    }
  };

  const SortHeader = ({
    column,
    children,
  }: {
    column: string;
    children: React.ReactNode;
  }) => (
    <th
      className="text-left p-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50/50 transition-colors"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <div className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</div>
        )}
      </div>
    </th>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200/50">
              <SortHeader column="nameRu">Организация</SortHeader>
              <SortHeader column="district">Район</SortHeader>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Контакты
              </th>
              <SortHeader column="currentRating">Рейтинг</SortHeader>
              <SortHeader column="currentStudents">Учащиеся</SortHeader>
              <th className="text-left p-6 text-sm font-semibold text-slate-700">
                Заполненность
              </th>
              <th className="text-center p-6 text-sm font-semibold text-slate-700">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org, index) => (
              <tr
                key={org.id}
                className={`border-b border-slate-200/30 hover:bg-slate-50/50 transition-colors ${
                  index % 2 === 0 ? "bg-slate-25/30" : ""
                }`}
              >
                <td className="p-6">
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">
                      {org.nameRu}
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      {org.nameKz}
                    </div>
                    <div className="text-xs text-slate-500">
                      {org.organizationType}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      {org.address}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    {org.district}
                  </div>
                </td>
                <td className="p-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-slate-600">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="truncate max-w-xs">{org.director}</span>
                    </div>
                    {org.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        {org.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-10 h-10 rounded-xl ${getRatingZoneColor(
                        org.ratingZone
                      )} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white font-bold text-sm">
                        {org.currentRating}
                      </span>
                    </div>
                    <Badge
                      className={`text-xs font-medium ${getRatingZoneColor(
                        org.ratingZone
                      )} text-white border-0`}
                    >
                      {getZoneName(org.ratingZone)}
                    </Badge>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <div className="text-center">
                    <div className="font-semibold text-slate-800">
                      {org.currentStudents.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      из {org.capacity.toLocaleString()}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">
                        {Math.round((org.currentStudents / org.capacity) * 100)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (org.currentStudents / org.capacity) * 100 > 90
                            ? "bg-red-500"
                            : (org.currentStudents / org.capacity) * 100 > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        data-width={`${Math.min(
                          (org.currentStudents / org.capacity) * 100,
                          100
                        )}%`}
                        style={{
                          width: `${Math.min(
                            (org.currentStudents / org.capacity) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(org)}
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
  );
};
