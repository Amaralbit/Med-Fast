"use server"

import { auth, signOut } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { verifyActionToken } from "@/lib/security/form-protection"

export async function deleteAccount(actionToken: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  try {
    await verifyActionToken(actionToken, "account:delete", session.user.id, 2 * 60 * 60 * 1000, true)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha de segurança na requisição" }
  }

  const userId = session.user.id

  try {
    await prisma.$transaction(async (tx) => {
      if (session.user.role === "DOCTOR") {
        const profile = await tx.doctorProfile.findUnique({ where: { userId }, select: { id: true } })
        if (profile) {
          await tx.medicalDocument.deleteMany({ where: { doctorProfileId: profile.id } })
          await tx.consultationNote.deleteMany({ where: { doctorProfileId: profile.id } })
          await tx.appointment.deleteMany({ where: { doctorProfileId: profile.id } })
        }
      } else {
        const profile = await tx.patientProfile.findUnique({ where: { userId }, select: { id: true } })
        if (profile) {
          await tx.medicalDocument.deleteMany({ where: { patientProfileId: profile.id } })
          await tx.consultationNote.deleteMany({ where: { patientProfileId: profile.id } })
          await tx.appointment.deleteMany({ where: { patientProfileId: profile.id } })
        }
      }

      await tx.user.delete({ where: { id: userId } })
    })
  } catch (err) {
    console.error("[deleteAccount]", err)
    return { error: "Não foi possível excluir a conta. Tente novamente." }
  }

  await signOut({ redirect: false })
  redirect("/")
}
