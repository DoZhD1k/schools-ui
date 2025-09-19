import React from "react";
import { motion, Variants } from "framer-motion";

interface AdminHeaderProps {
  title: string;
  description: string;
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: swissEase,
      delay: custom * 0.1,
    },
  }),
};

const headerLineVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: swissEase,
      delay: 0.2,
    },
  },
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <motion.h1
        variants={itemVariants}
        custom={0}
        className="text-4xl font-bold tracking-tight"
      >
        {title}
      </motion.h1>

      <motion.p
        variants={itemVariants}
        custom={1}
        className="text-muted-foreground max-w-3xl"
      >
        {description}
      </motion.p>

      <motion.div
        variants={headerLineVariants}
        className="w-24 h-1 bg-foreground mt-6"
      />
    </div>
  );
};

export default AdminHeader;
