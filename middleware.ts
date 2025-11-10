// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales;

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // Отладочная информация для Vercel
  if (process.env.NODE_ENV === "production") {
    console.log("Middleware debug:", {
      pathname,
      hasAuthToken: !!authToken,
      cookies: Object.fromEntries(
        request.cookies
          .getAll()
          .map((c) => [c.name, c.value.substring(0, 10) + "..."])
      ),
      host: request.headers.get("host"),
      userAgent: request.headers.get("user-agent")?.substring(0, 50),
    });
  }

  // Define regex for public files
  const PUBLIC_FILE =
    /\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|json|mp4|mp3)$/i;

  // Check if pathname should be ignored (public files and Next.js internals)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") || // ВАЖНО: ваша папка со статикой
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Define protected paths, including dynamic segments
  const protectedPaths = [
    "/admin",
    "/map",
    "/dashboard",
    "/schools/**",
    "/analytics",
    "/deficit",
    "/profile",
    "/schools/passport/",
  ];
  const isProtectedRoute = protectedPaths.some((protectedPath) =>
    pathname.includes(protectedPath)
  );

  // Handle root redirect (adjusted for i18n)
  if (pathname === "/") {
    const locale = getLocale(request);
    // Перенаправляем на главную страницу с локалью
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Handle locale redirection first if needed
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    // Create the new URL with the locale prefix
    const newUrl = new URL(
      `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
      request.url
    );
    return NextResponse.redirect(newUrl);
  }

  // After locale is handled, check authentication for protected routes
  if (isProtectedRoute) {
    // Убираем проверку куков в middleware и полагаемся полностью на клиентскую авторизацию
    // AuthContext будет обрабатывать редиректы на /sign-in
    return NextResponse.next();
  }

  // Continue the request for all other routes
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    // Skip all API routes
    // Skip all static files
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|txt|xml|json|mp4|mp3)).*)",
    // Original protected paths
    "/map/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    // Schools paths
    "/schools/:path*",
  ],
};
