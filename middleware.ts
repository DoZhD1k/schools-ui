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
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Check if pathname should be ignored (public files)
  if (["/manifest.json", "/favicon.ico"].includes(pathname))
    return NextResponse.next();

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Define protected paths, including dynamic segments
  const protectedPaths = ["/admin", "/map", "/dashboard"];
  const isProtectedRoute = protectedPaths.some((protectedPath) =>
    pathname.includes(protectedPath)
  );

  // Handle root redirect (adjusted for i18n)
  if (pathname === "/") {
    const locale = getLocale(request);
    // If user has refresh token, redirect to dashboard, otherwise to main page
    if (refreshToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url)
      );
    }
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
    if (!refreshToken) {
      // If token is absent, redirect to sign-in page (with locale)
      const locale = pathname.split("/")[1]; // Extract locale from path
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      return NextResponse.redirect(signInUrl);
    }
    // Token exists, proceed to the requested page
    return NextResponse.next();
  }

  // Continue the request for all other routes
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    // i18n paths
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Original protected paths
    "/map/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    // Schools paths
    "/schools/:path*",
  ],
};
