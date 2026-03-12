"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: "up" | "down";
  trendValue?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  trendValue,
}: StatCardProps) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "from-emerald-500/20 to-teal-600/20 border-emerald-200/50";
      case "warning":
        return "from-amber-500/20 to-orange-600/20 border-amber-200/50";
      case "danger":
        return "from-red-500/20 to-rose-600/20 border-red-200/50";
      default:
        return "from-blue-500/20 to-indigo-600/20 border-blue-200/50";
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getVariantClass()} backdrop-blur-md rounded-3xl`}
      ></div>
      <div className="absolute inset-0 rounded-3xl border border-[hsl(0_0%_100%_/_0.2)] shadow-lg"></div>
      <div className="relative p-6 text-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.1)] shadow-sm">
            {icon}
          </div>
          {trend && (
            <div
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
