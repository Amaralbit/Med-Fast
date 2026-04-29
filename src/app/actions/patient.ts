"use server"

import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"
import { sendAppointmentCancelledToDoctor } from "@/lib/email"
import { getActionTokenValue, verifyActionToken } from "@/lib/security/form-protection"

export async function cancelPatientAppointment(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "PATIENT") return

  await verifyActionToken(getActionTokenValue(formData), "patient:cancel-appointment", session.user.id)

  const appointmentId = formData.get("appointmentId")?.toString()
  if (!appointmentId) return

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  })
  if (!patientProfile) return

  const appt = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientProfileId: patientProfile.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      doctorProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })
  if (!appt) return

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  })

  revalidatePath("/dashboard/patient/consultas")

  sendAppointmentCancelledToDoctor({
    doctorEmail: appt.doctorProfile.user.email,
    doctorName: appt.doctorProfile.user.name,
    patientName: patientProfile.user.name,
    startAt: appt.startAt,
  }).catch(() => {})
}
