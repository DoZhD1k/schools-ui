import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "default",
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-slate-900/60 hover:shadow-emerald-500/20";
      case "warning":
        return "border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white dark:border-amber-800/60 dark:from-amber-950/40 dark:to-slate-900/60 hover:shadow-amber-500/20";
      case "destructive":
        return "border-red-200/60 bg-gradient-to-br from-red-50/80 to-white dark:border-red-800/60 dark:from-red-950/40 dark:to-slate-900/60 hover:shadow-red-500/20";
      default:
        return "border-slate-200/60 bg-gradient-to-br from-white/80 to-slate-50/60 dark:border-slate-700/60 dark:from-slate-800/80 dark:to-slate-900/60 hover:shadow-blue-500/20";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "p-3.5 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600 dark:text-emerald-400 shadow-lg";
      case "warning":
        return "p-3.5 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600 dark:text-amber-400 shadow-lg";
      case "destructive":
        return "p-3.5 rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-600 dark:text-red-400 shadow-lg";
      default:
        return "p-3.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400 shadow-lg";
    }
  };

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 backdrop-blur-sm ${getVariantStyles()}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          {title}
        </CardTitle>
        {icon && (
          <div
            className={`group-hover:scale-110 transition-transform duration-300 ${getIconStyles()}`}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {value}
          </div>
          {trend && trendValue && (
            <Badge
              variant="outline"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold ${
                trend === "up"
                  ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 dark:border-emerald-700 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300"
                  : trend === "down"
                  ? "border-red-300 bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:border-red-700 dark:from-red-950 dark:to-red-900 dark:text-red-300"
                  : "border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300"
              }`}
            >
              {getTrendIcon()}
              <span className="text-xs font-bold">{trendValue}</span>
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-semibold">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
