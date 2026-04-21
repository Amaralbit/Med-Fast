export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-md">
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
