export const i18n = {
  defaultLocale: "ru",
  locales: ["en", "ru", "kz"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
