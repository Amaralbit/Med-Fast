import { MedicalDecorations } from "../medical-decorations"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 dark:bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.16),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(34,211,238,0.16),transparent_26%)]" />
      <div className="kinetic-grid absolute inset-0 opacity-45" />
      <MedicalDecorations variant="auth" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-500 dark:text-cyan-400">
            MedFast
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Secretária virtual para consultórios
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
