import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "MedFast — Secretária Virtual para Consultórios",
  description: "Agendamentos automáticos via IA para médicos e pacientes",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-white dark:bg-black text-gray-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
