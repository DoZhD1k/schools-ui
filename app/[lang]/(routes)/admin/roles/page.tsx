/**
 * Admin Roles Page
 * Страница управления ролями
 */

import { Metadata } from "next";
import SimpleRolesPage from "@/components/admin/simple-roles-page";

export const metadata: Metadata = {
  title: "Управление ролями | Школьный рейтинг",
  description: "Настройка ролей и прав доступа пользователей",
};

export default function AdminRolesPage() {
  return <SimpleRolesPage />;
}
