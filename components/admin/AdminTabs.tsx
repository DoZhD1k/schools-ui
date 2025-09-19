import React from "react";
import { motion } from "framer-motion";
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
  activeTab: string;
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

const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onTabChange,
  tabLabels,
}) => {
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.div
              key={tab.id}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-full"
            >
              <TabsTrigger
                value={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full h-full py-4 px-3 flex flex-col items-center gap-2 transition-all duration-300",
                  "border border-transparent rounded-lg",
                  "hover:bg-white/60 dark:hover:bg-slate-700/60",
                  "data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-emerald-500",
                  "data-[state=active]:text-white data-[state=active]:shadow-lg",
                  isActive ? "shadow-lg scale-105" : ""
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive
                      ? "text-white scale-110"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold transition-all duration-300 text-center leading-tight",
                    isActive
                      ? "text-white"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "text-[10px] opacity-70 transition-all duration-300 text-center leading-tight hidden sm:block",
                    isActive
                      ? "text-white/80"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {tab.description}
                </span>
              </TabsTrigger>
            </motion.div>
          );
        })}
      </TabsList>
    </motion.div>
  );
};

export default AdminTabs;
