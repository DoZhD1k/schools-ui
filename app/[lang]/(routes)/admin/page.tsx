"use client";

import React from "react";
import AdminDashboard from "../../../../components/admin/admin-dashboard";
import AdminLayout from "../../../../components/admin/admin-layout";

export default function AdminHomePage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
