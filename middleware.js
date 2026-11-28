import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = new Set(["id", "en"]);
const DEFAULT_LOCALE = "id";
const LOCALE_COOKIE = "df-locale";
const LEGACY_COUPLE_EDITOR_PREFIX = "/app/create-profile-couple";
const PUBLIC_COUPLE_EDITOR_PREFIX = "/df/profile-couple-maker";

function isPathOrChild(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function replacePathPrefix(pathname, from, to) {
  return `${to}${pathname.slice(from.length)}`;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // OAuth callbacks and API endpoints must retain their existing callback contracts.
  if (pathname.startsWith("/api/") || pathname === "/auth/callback") {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (SUPPORTED_LOCALES.has(firstSegment)) {
    const locale = firstSegment;
    const localizedPath = "/" + segments.slice(2).join("/");

    if (isPathOrChild(localizedPath, LEGACY_COUPLE_EDITOR_PREFIX)) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/${locale}${replacePathPrefix(localizedPath, LEGACY_COUPLE_EDITOR_PREFIX, PUBLIC_COUPLE_EDITOR_PREFIX)}`;
      return NextResponse.redirect(destination, 307);
    }

    const destination = request.nextUrl.clone();
    const internalPath = isPathOrChild(localizedPath, PUBLIC_COUPLE_EDITOR_PREFIX)
      ? replacePathPrefix(localizedPath, PUBLIC_COUPLE_EDITOR_PREFIX, LEGACY_COUPLE_EDITOR_PREFIX)
      : localizedPath;
    destination.pathname = internalPath === "/" ? "/" : internalPath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-df-locale", locale);
    requestHeaders.set("x-df-path", localizedPath);

    const response = NextResponse.rewrite(destination, {
      request: { headers: requestHeaders },
    });

    // Persist locale only when it changes; repeated writes prevent public-page CDN caching.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = SUPPORTED_LOCALES.has(savedLocale) ? savedLocale : DEFAULT_LOCALE;
  const destination = request.nextUrl.clone();

  if (isPathOrChild(pathname, LEGACY_COUPLE_EDITOR_PREFIX)) {
    destination.pathname = `/${locale}${replacePathPrefix(pathname, LEGACY_COUPLE_EDITOR_PREFIX, PUBLIC_COUPLE_EDITOR_PREFIX)}`;
    return NextResponse.redirect(destination, 307);
  }

  destination.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
