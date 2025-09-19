import DashboardPage from "@/components/dashboard/dashboard-page";
import { Locale } from "@/i18n-config";

export default async function Dashboard({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = await params;

  return <DashboardPage params={{ lang }} />;
}
