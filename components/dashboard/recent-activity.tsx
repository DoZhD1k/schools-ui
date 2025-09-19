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
        return "p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "rating_updated":
        return "p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "collection_uploaded":
        return "p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "user_registered":
        return "p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      default:
        return "p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
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
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
          Последние события
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Активность в системе за последнее время
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                  index === 0
                    ? "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/30"
                    : "border-slate-100 dark:border-slate-700"
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`rounded-lg border ${getActivityBadgeStyles(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
