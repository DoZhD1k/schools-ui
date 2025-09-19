import type { Locale } from "./i18n-config";

// We enumerate all dictionaries here for better linting and typescript support
// We're using the files in dictionaries/ directory
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ru: () => import("./dictionaries/ru.json").then((module) => module.default),
  kz: () => import("./dictionaries/kz.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.ru();
};
