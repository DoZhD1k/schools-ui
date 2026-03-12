import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = [...i18n.locales];
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
      locales
  );

  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js strips basePath before passing pathname to middleware.
  // So pathname here is already without /module-school-ranking prefix.

  // === ВАЖНО: игнорируем статику ===
  const PUBLIC_FILE =
      /\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|json|mp4|mp3)$/i;

  if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Проверяем, есть ли локаль в пути
  const pathnameHasLocale = i18n.locales.some(
      (locale) =>
          pathname.startsWith(`/${locale}/`) ||
          pathname === `/${locale}`
  );

  // === КЕЙС 1: ОТКРЫВАЮТ РУТ МОДУЛЯ (корневой путь) ===
  if (pathname === "/" || pathname === "") {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    // Редиректим на sign-in, так как авторизация проверяется на клиенте
    // Если пользователь авторизован, он будет перенаправлен на dashboard
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // === КЕЙС 2: НЕТ ЛОКАЛИ В ПУТИ → добавляем ===
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${cleanPath}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
