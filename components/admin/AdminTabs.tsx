import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Users,
  Shield,
  Database,
  MapPin,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  onTabChange: (value: string) => void;
  tabLabels: {
    dashboard: string;
    users: string;
    roles: string;
    collections: string;
    features: string;
    settings: string;
  };
}

const AdminTabs: React.FC<AdminTabsProps> = ({ onTabChange, tabLabels }) => {
  const tabs = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: tabLabels.dashboard,
      description: "Обзор системы",
    },
    {
      id: "users",
      icon: Users,
      label: tabLabels.users,
      description: "Управление пользователями",
    },
    {
      id: "roles",
      icon: Shield,
      label: tabLabels.roles,
      description: "Роли и доступы",
    },
    {
      id: "collections",
      icon: Database,
      label: tabLabels.collections,
      description: "Коллекции данных",
    },
    {
      id: "features",
      icon: MapPin,
      label: tabLabels.features,
      description: "Функции карты",
    },
    {
      id: "settings",
      icon: Settings,
      label: tabLabels.settings,
      description: "Настройки системы",
    },
  ];

  return (
    <div className="w-full">
      <TabsList className="grid w-full grid-cols-6 h-auto p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full py-3 px-2 flex flex-col items-center gap-1.5 transition-colors",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium text-center leading-tight">
                {tab.label}
              </span>
              <span className="text-[10px] opacity-70 text-center leading-tight hidden sm:block">
                {tab.description}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};

export default AdminTabs;
