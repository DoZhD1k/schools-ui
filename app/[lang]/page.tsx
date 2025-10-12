import { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  return redirect(`/${lang}/dashboard`);
}
