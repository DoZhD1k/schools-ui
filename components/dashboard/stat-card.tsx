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
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case "neutral":
        return <Minus className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getCardStyles = () => {
    switch (variant) {
      case "success":
        return "bg-white/70 border-[hsl(0_0%_100%_/_0.2)] backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/80";
      case "warning":
        return "bg-white/70 border-[hsl(0_0%_100%_/_0.2)] backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/80";
      case "destructive":
        return "bg-white/70 border-[hsl(0_0%_100%_/_0.2)] backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/80";
      default:
        return "bg-white/70 border-[hsl(0_0%_100%_/_0.2)] backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/80";
    }
  };

  const getIconContainerClass = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-br from-emerald-500 to-green-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      case "warning":
        return "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      case "destructive":
        return "bg-gradient-to-br from-red-500 to-rose-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      default:
        return "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
    }
  };

  return (
    <Card
      className={`transition-all duration-300 hover:scale-105 hover:shadow-3xl border rounded-3xl ${getCardStyles()}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transform hover:scale-110 transition-transform duration-300 ${getIconContainerClass()}`}
            >
              {icon}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold text-slate-800">{value}</div>
          {trend && trendValue && (
            <Badge
              variant="secondary"
              className={`flex items-center space-x-1 text-xs font-semibold rounded-xl backdrop-blur-sm border border-[hsl(0_0%_100%_/_0.2)] shadow-sm ${
                trend === "up"
                  ? "text-green-700 bg-green-100/80"
                  : trend === "down"
                  ? "text-red-700 bg-red-100/80"
                  : "text-slate-700 bg-slate-100/80"
              }`}
            >
              {getTrendIcon()}
              <span>{trendValue}</span>
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-600 mt-2 font-medium">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
