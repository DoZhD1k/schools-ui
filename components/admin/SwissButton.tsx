import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwissButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline";
}

const SwissButton: React.FC<SwissButtonProps> = ({
  children,
  onClick,
  icon,
  variant = "default",
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.2 }}
  >
    <Button
      variant={variant}
      onClick={onClick}
      className={cn(
        "transition-all duration-300 font-medium tracking-wide ",
        variant === "default" ? "px-5 py-6 h-auto" : "px-4 py-5 h-auto"
      )}
    >
      {icon}
      {children}
    </Button>
  </motion.div>
);

export default SwissButton;
