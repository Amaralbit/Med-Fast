import crypto from "node:crypto"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import { ACTION_TOKEN_COOKIE } from "@/lib/security/form-protection-shared"

const { auth } = NextAuth(authConfig)

function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development"
  return [
    "default-src 'self'",
    // strict-dynamic lets scripts loaded by nonce-valid scripts also run (Next.js dynamic imports)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // unsafe-inline needed for style attributes used in components; nonce for <style> tags
    `style-src 'self' 'unsafe-inline'`,
    // Allow Vercel Blob public store for profile photos and medical documents
    "img-src 'self' blob: data: https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  return response
}

export default auth((req) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = buildCSP(nonce)

  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isHome = nextUrl.pathname === "/"
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
  const isDoctorRoute = nextUrl.pathname.startsWith("/dashboard/doctor")
  const isPatientRoute = nextUrl.pathname.startsWith("/dashboard/patient")

  if (isLoggedIn && (isAuthRoute || isHome)) {
    const role = (session!.user as { role?: string }).role
    return applySecurityHeaders(
      NextResponse.redirect(
        new URL(role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient", nextUrl)
      ),
      csp
    )
  }

  if (!isLoggedIn && (isDoctorRoute || isPatientRoute)) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/login", nextUrl)), csp)
  }

  const role = isLoggedIn ? (session!.user as { role?: string }).role : undefined
  if (isLoggedIn && isDoctorRoute && role !== "DOCTOR") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard/patient", nextUrl)),
      csp
    )
  }
  if (isLoggedIn && isPatientRoute && role !== "PATIENT") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard/doctor", nextUrl)),
      csp
    )
  }

  // Pass nonce to server components via x-nonce header.
  // Next.js reads Content-Security-Policy from requestHeaders to extract the nonce
  // and automatically applies it to framework scripts and bundles.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    csp
  )

  if (!req.cookies.get(ACTION_TOKEN_COOKIE)?.value) {
    response.cookies.set(ACTION_TOKEN_COOKIE, crypto.randomBytes(32).toString("base64url"), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  return response
})

export const config = {
  matcher: [
    {
      // Exclude static assets and prefetch requests — they don't need a fresh nonce
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
