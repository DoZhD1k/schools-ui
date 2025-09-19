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
        return "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30";
      case "warning":
        return "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30";
      case "destructive":
        return "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30";
      default:
        return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "warning":
        return "p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      case "destructive":
        return "p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:
        return "p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getVariantStyles()}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon && <div className={getIconStyles()}>{icon}</div>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-3">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </div>
          {trend && trendValue && (
            <Badge
              variant="outline"
              className={`flex items-center space-x-1 px-2 py-1 ${
                trend === "up"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : trend === "down"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                  : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {getTrendIcon()}
              <span className="text-xs font-medium">{trendValue}</span>
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
