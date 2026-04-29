"use server"

import crypto from "node:crypto"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"
import type { Role } from "@/generated/prisma/client"
import { prisma } from "@/server/db"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { checkRateLimit } from "@/lib/rate-limit"
import { createActionToken, getActionTokenValue, verifyActionToken } from "@/lib/security/form-protection"
import { sanitizeEmail, sanitizePlainText } from "@/lib/security/sanitize"

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  email: z.email("E-mail inválido").max(254, "E-mail inválido"),
  // bcrypt silently truncates at 72 bytes — cap it there
  password: z.string().min(6, "Mínimo 6 caracteres").max(72, "Senha muito longa"),
  role: z.enum(["DOCTOR", "PATIENT"]),
  terms: z.union([z.literal("on"), z.literal("true")]),
})

export type AuthState = { error?: string; success?: boolean }

export async function createLoginActionToken() {
  return createActionToken("auth:login")
}

export async function createRegisterActionToken() {
  return createActionToken("auth:register")
}

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1"
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await verifyActionToken(getActionTokenValue(formData), "auth:register")
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const ip = await getClientIp()

  // 5 registration attempts per 15 minutes per IP
  const rl = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return { error: "Muitas tentativas de cadastro. Aguarde 15 minutos e tente novamente." }
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    terms: formData.get("terms"),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const name = sanitizePlainText(parsed.data.name, 100)
  const email = sanitizeEmail(parsed.data.email)
  const password = parsed.data.password
  const role = parsed.data.role

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { error: "E-mail já cadastrado" }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as Role,
        ...(role === "DOCTOR"
          ? {
              doctorProfile: {
                create: {
                  slug:
                    email.split("@")[0].replace(/[^a-z0-9]/g, "-") +
                    "-" +
                    crypto.randomUUID().slice(0, 8),
                },
              },
            }
          : {
              patientProfile: { create: {} },
            }),
      },
    })
  } catch (error) {
    console.error("register action failed", error)
    return { error: "Não foi possível criar a conta agora. Tente novamente." }
  }

  await signIn("credentials", { email, password, redirect: false })
  redirect(role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient")
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await verifyActionToken(getActionTokenValue(formData), "auth:login")
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const ip = await getClientIp()

  // 10 login attempts per 15 minutes per IP — brute-force protection
  const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
  if (!rl.allowed) {
    return { error: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." }
  }

  const rawEmail = formData.get("email")?.toString()
  const email = rawEmail ? sanitizeEmail(rawEmail) : undefined

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos" }
    }
    throw error
  }

  const user = email ? await prisma.user.findUnique({ where: { email }, select: { role: true } }) : null
  redirect(user?.role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient")
}

export async function signOutAction(formData: FormData) {
  await verifyActionToken(getActionTokenValue(formData), "auth:signout")
  await signOut({ redirect: false })
  redirect("/login")
}
