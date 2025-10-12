"use client";

import React from "react";
import { Eye, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CombinedSchool {
  id: number;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  district: string;
  gis_rating: number | null;
  academic_results_rating?: number;
  pedagogical_potential_rating?: number;
  safety_climate_rating?: number;
  infrastructure_rating?: number;
  graduate_success_rating?: number;
  penalty_rating?: number;
  digital_rating?: number;
}

interface SchoolCardProps {
  school: CombinedSchool;
  onView: (school: CombinedSchool) => void;
}

export const SchoolCard = ({ school, onView }: SchoolCardProps) => {
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

  const getPercentage = (value?: number) => {
    if (value === undefined || value === null)
      return <span className={`px-2 py-1 text-gray-600`}>-</span>;

    return (
      <span className={` font-semibold px-2 py-1 rounded-md`}>
        {value.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {school.name_of_the_organization}
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              {school.types_of_educational_institutions}
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">{school.district}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-bold text-lg">
                  {school.digital_rating ?? "—"}
                </span>
              </div>
              {getColoredRating(school.gis_rating ?? null)}
            </div>
            <Badge className={`text-xs font-medium text-white border-0`}>
              {/* Zone name can be added here */}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-blue-600">
              {getPercentage(school.academic_results_rating)}
            </div>
            <div className="text-xs text-slate-500">1-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-emerald-600">
              {getPercentage(school.pedagogical_potential_rating)}
            </div>
            <div className="text-xs text-slate-500">2-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-purple-600">
              {getPercentage(school.safety_climate_rating)}
            </div>
            <div className="text-xs text-slate-500">3-я четв.</div>
          </div>
          <div className="text-center bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="text-lg font-bold text-amber-600">
              {getPercentage(school.graduate_success_rating)}
            </div>
            <div className="text-xs text-slate-500">Годовой</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{getColoredRating(school.gis_rating)}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(school)}
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
