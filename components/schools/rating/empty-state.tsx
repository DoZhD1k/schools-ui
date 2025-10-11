"use client";

import React from "react";
import { School } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

export const EmptyState = ({ onReset }: EmptyStateProps) => {
  return (
    <div className="relative overflow-hidden mt-12">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
      <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
      <div className="relative p-12 text-center">
        <School className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Школы не найдены
        </h3>
        <p className="text-slate-600 mb-6">
          Попробуйте изменить поисковый запрос или фильтры
        </p>
        <Button
          onClick={onReset}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        >
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
};
