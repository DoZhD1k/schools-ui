import React from "react";
import { motion } from "framer-motion";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tabLabels: {
    collections: string;
    features: string;
    users: string;
  };
}

const AdminTabs: React.FC<AdminTabsProps> = ({ tabLabels }) => {
  const renderTabIcon = (tabName: string) => {
    switch (tabName) {
      case "collections":
        return <Grid className="mr-2 h-4 w-4" />;
      case "features":
        return <ChevronRight className="mr-2 h-4 w-4" />;
      case "users":
        return <Users className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/90">
        {["collections", "features", "users"].map((tab) => (
          <motion.div
            key={tab}
            whileHover={{
              backgroundColor: "rgba(255,255,255,0.1)",
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full h-full"
          >
            <TabsTrigger
              value={tab}
              className={cn(
                "data-[state=active]:bg-background data-[state=active]:text-foreground w-full h-full py-3",
                "transition-all duration-300 uppercase tracking-wide text-xs font-medium "
              )}
            >
              {renderTabIcon(tab)}
              {tabLabels[tab as keyof typeof tabLabels]}
            </TabsTrigger>
          </motion.div>
        ))}
      </TabsList>
    </motion.div>
  );
};

export default AdminTabs;
