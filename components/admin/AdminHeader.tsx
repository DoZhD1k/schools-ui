import React from "react";

interface AdminHeaderProps {
  title: string;
  description: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground max-w-3xl">{description}</p>
    </div>
  );
};

export default AdminHeader;
