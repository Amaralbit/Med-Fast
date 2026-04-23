"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import type { Role } from "@/generated/prisma/client"
import { prisma } from "@/server/db"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["DOCTOR", "PATIENT"]),
})

export type AuthState = { error?: string; success?: boolean }

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { name, email, password, role } = parsed.data

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
                    email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") +
                    "-" +
                    Math.random().toString(36).slice(2, 6),
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

  // Fora do try/catch para que o NEXT_REDIRECT do signIn propague corretamente
  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient",
  })

  return { success: true }
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email")?.toString()

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