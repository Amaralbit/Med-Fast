"use server"

import { auth, signOut } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"

export async function deleteAccount(): Promise<{ error?: string }> {
  const session = await auth()
  if (!session) return { error: "Não autenticado" }

  const userId = session.user.id

  try {
    await prisma.$transaction(async (tx) => {
      if (session.user.role === "DOCTOR") {
        const profile = await tx.doctorProfile.findUnique({ where: { userId }, select: { id: true } })
        if (profile) {
          // Delete in order: docs and notes reference appointments without cascade
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

      // User delete cascades: profile, notifications, weekly availabilities,
      // blocked slots, chat questions, media, health plans
      await tx.user.delete({ where: { id: userId } })
    })
  } catch (err) {
    console.error("[deleteAccount]", err)
    return { error: "Não foi possível excluir a conta. Tente novamente." }
  }

  await signOut({ redirect: false })
  redirect("/")
}