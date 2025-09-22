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
        return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getActivityIconClass = (type: string) => {
    switch (type) {
      case "school_added":
        return "bg-gradient-to-br from-blue-500 to-blue-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      case "rating_updated":
        return "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      case "collection_uploaded":
        return "bg-gradient-to-br from-emerald-500 to-green-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      case "user_registered":
        return "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
      default:
        return "bg-gradient-to-br from-slate-500 to-slate-600 text-white border border-[hsl(0_0%_100%_/_0.1)] shadow-lg";
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
    <Card className="bg-white/70 backdrop-blur-md border border-[hsl(0_0%_100%_/_0.2)] rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">
          Последние события
        </CardTitle>
        <p className="text-sm text-slate-600 font-medium">
          Активность в системе за последнее время
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  index === 0
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-[hsl(0_0%_100%_/_0.3)] shadow-md"
                    : "bg-white/50 border border-[hsl(0_0%_100%_/_0.2)] shadow-sm hover:bg-white/70"
                }`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transform hover:scale-110 transition-transform duration-300 ${getActivityIconClass(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
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
