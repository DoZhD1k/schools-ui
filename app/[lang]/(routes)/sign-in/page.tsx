import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import LoginForm from "./login-form";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  // Await the params to access the lang property
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <LoginForm dictionary={dictionary} />;
}
