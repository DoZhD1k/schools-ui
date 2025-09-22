import React from "react";
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
  <Button
    variant={variant}
    onClick={onClick}
    className={cn(
      "transition-colors font-medium",
      variant === "default" ? "px-4 py-2" : "px-3 py-2"
    )}
  >
    {icon}
    {children}
  </Button>
);

export default SwissButton;
