"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/server/db"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import type { Role } from "@/generated/prisma/enums"

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
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password, role } = parsed.data

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

  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient",
  })

  return { success: true }
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos" }
    }
    throw error
  }
  redirect("/dashboard/patient")
}