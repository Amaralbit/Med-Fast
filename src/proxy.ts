import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isHome = nextUrl.pathname === "/"
  const isAuthRoute = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register")
  const isDoctorRoute = nextUrl.pathname.startsWith("/dashboard/doctor")
  const isPatientRoute = nextUrl.pathname.startsWith("/dashboard/patient")

  if (isLoggedIn && (isAuthRoute || isHome)) {
    const role = (session!.user as { role?: string }).role
    return NextResponse.redirect(
      new URL(role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient", nextUrl)
    )
  }

  if (!isLoggedIn && (isDoctorRoute || isPatientRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  const role = isLoggedIn ? (session!.user as { role?: string }).role : undefined
  if (isLoggedIn && isDoctorRoute && role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/dashboard/patient", nextUrl))
  }
  if (isLoggedIn && isPatientRoute && role !== "PATIENT") {
    return NextResponse.redirect(new URL("/dashboard/doctor", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}