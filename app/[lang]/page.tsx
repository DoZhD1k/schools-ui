import Storytelling from "@/components/story-tell";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function HomePage({
  params,
}: {
  params: { lang: Locale };
}) {
  // Await the params to access the lang property
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <Storytelling dictionary={dictionary} />;
}
