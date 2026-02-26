"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Eye, MapPin, Phone, User } from "lucide-react";

export interface OrganizationData {
  id: string;
  nameRu: string;
  nameKz: string;
  organizationType: string;
  district: string;
  address: string;
  phone?: string;
  director: string;
  currentRating: number;
  currentStudents: number;
  capacity: number;
  ratingZone: "green" | "yellow" | "red";
  website?: string;
  email?: string;
}

interface OrganizationCardProps {
  organization: OrganizationData;
  onView: (org: OrganizationData) => void;
}

export const OrganizationCard = ({
  organization,
  onView,
}: OrganizationCardProps) => {
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

  const getCapacityPercentage = () => {
    return Math.round(
      (organization.currentStudents / organization.capacity) * 100,
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl shadow-lg"></div>
      <div className="relative p-4 md:p-6">
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-lg font-bold text-slate-800 mb-1 line-clamp-2">
              {organization.nameRu}
            </h3>
            <p className="text-sm text-slate-600 mb-1">{organization.nameKz}</p>
            <p className="text-xs text-slate-500 mb-2">
              {organization.organizationType}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {organization.district}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {organization.address}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-12 h-12 rounded-2xl ${getRatingZoneColor(
                  organization.ratingZone,
                )} flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">
                  {organization.currentRating}
                </span>
              </div>
            </div>
            <Badge
              className={`text-xs font-medium ${getRatingZoneColor(
                organization.ratingZone,
              )} text-white border-0`}
            >
              {getZoneName(organization.ratingZone)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-blue-600">
              {organization.currentStudents.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Учащиеся</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-emerald-600">
              {organization.capacity.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Вместимость</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Заполненность</span>
            <span className="text-slate-800 font-medium">
              {getCapacityPercentage()}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                getCapacityPercentage() > 90
                  ? "bg-red-500"
                  : getCapacityPercentage() > 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              data-width={`${Math.min(getCapacityPercentage(), 100)}%`}
              style={{ width: `${Math.min(getCapacityPercentage(), 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <User className="h-4 w-4" />
            <span>{organization.director}</span>
          </div>
          {organization.phone && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              <span>{organization.phone}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(organization)}
            className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            Паспорт
          </Button>
        </div>
      </div>
    </div>
  );
};
