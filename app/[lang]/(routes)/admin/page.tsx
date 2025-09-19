import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import AdminDashboard from "./admin-dashboard";

export default async function AdminPage({
  params,
}: {
  params: { lang: Locale };
}) {
  // Await the params to access the lang property
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <AdminDashboard dictionary={dictionary} />;
}
