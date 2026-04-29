import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { PhotoUpload } from "./photo-upload"
import { DeleteAccountButton } from "@/components/delete-account-button"
import { createActionToken } from "@/lib/security/form-protection"

export default async function PerfilPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  })

  if (!profile) redirect("/dashboard/doctor")

  const [deleteAccountToken, photoUploadToken, profileFormToken] = await Promise.all([
    createActionToken("account:delete", session.user.id),
    createActionToken("doctor:upload-profile-photo", session.user.id),
    createActionToken("doctor:save-profile", session.user.id),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Essas informações aparecem na sua página pública para os pacientes
          </p>
        </div>
        <DeleteAccountButton actionToken={deleteAccountToken} />
      </div>

      <PhotoUpload currentPhotoUrl={profile.profilePhotoUrl} doctorName={profile.user.name} actionToken={photoUploadToken} />
      <ProfileForm profile={profile} actionToken={profileFormToken} />
    </div>
  )
}
