import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { School, Star, Upload, Users } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "school_added":
        return <School className="h-4 w-4" />;
      case "rating_updated":
        return <Star className="h-4 w-4" />;
      case "collection_uploaded":
        return <Upload className="h-4 w-4" />;
      case "user_registered":
        return <Users className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getActivityBadgeStyles = (type: string) => {
    switch (type) {
      case "school_added":
        return "p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-700/60 shadow-lg";
      case "rating_updated":
        return "p-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-700/60 shadow-lg";
      case "collection_uploaded":
        return "p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-700/60 shadow-lg";
      case "user_registered":
        return "p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-700/60 shadow-lg";
      default:
        return "p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-700/80 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-600/60 shadow-lg";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Только что";
    } else if (diffInHours < 24) {
      return `${diffInHours} ч. назад`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} дн. назад`;
    }
  };

  return (
    <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
          Последние события
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Активность в системе за последнее время
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-5">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`group flex items-start space-x-4 p-5 rounded-xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  index === 0
                    ? "border-slate-300/60 dark:border-slate-600/60 bg-gradient-to-r from-slate-50/80 to-white dark:from-slate-700/40 dark:to-slate-800/60 shadow-sm"
                    : "border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/30"
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`rounded-xl border group-hover:scale-110 transition-transform duration-300 ${getActivityBadgeStyles(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
