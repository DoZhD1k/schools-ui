"use client";

import React from "react";
import RolesAndPermissions from "../../../../../components/admin/roles-and-permissions";
import AdminLayout from "../../../../../components/admin/admin-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../../../components/ui/breadcrumb";

export default function AdminRolesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Роли и доступы</h1>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Админка</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Роли и доступы</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <RolesAndPermissions />
      </div>
    </AdminLayout>
  );
}
