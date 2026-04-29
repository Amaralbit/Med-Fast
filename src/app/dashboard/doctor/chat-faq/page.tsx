import { auth } from "@/auth"
import { prisma } from "@/server/db"
import { redirect } from "next/navigation"
import { FaqManager } from "./faq-manager"
import { createActionToken } from "@/lib/security/form-protection"

export default async function ChatFaqPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      chatQuestions: { orderBy: { order: "asc" } },
    },
  })
  if (!profile) redirect("/dashboard/doctor")
  const createActionTokenValue = await createActionToken("doctor:add-chat-question", session.user.id)
  const questions = await Promise.all(
    profile.chatQuestions.map(async (q) => ({
      ...q,
      removeActionToken: await createActionToken("doctor:remove-chat-question", session.user.id),
    }))
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat FAQ</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Perguntas e respostas que aparecem no chat do seu perfil público. O botão de WhatsApp é exibido automaticamente.
        </p>
      </div>

      <FaqManager questions={questions} whatsapp={profile.whatsapp} createActionToken={createActionTokenValue} />
    </div>
  )
}
