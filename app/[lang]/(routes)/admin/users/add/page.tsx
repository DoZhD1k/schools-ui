"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AddUserForm from "@/components/admin/add-user-form";
import AdminLayout from "@/components/admin/admin-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user-management";

export default function AddUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSuccess = (user: User) => {
    toast({
      title: "Пользователь создан",
      description: `Пользователь ${user.firstName} ${user.lastName} успешно создан`,
      variant: "default",
    });

    // Redirect to users list after successful creation
    router.push("/admin/users");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Добавить нового пользователя</h1>
          </div>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Админка</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/users">Пользователи</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Добавить пользователя</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <AddUserForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  );
}
