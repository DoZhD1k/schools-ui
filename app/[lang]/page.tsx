import { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: { lang: Locale };
}) {
  return redirect(`/${params.lang}/dashboard`);
}
