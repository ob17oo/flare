'use client'

import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <AlertCircle size={32} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Критическая системная ошибка</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Приложение не смогло загрузиться. Пожалуйста, перезапустите страницу или попробуйте сбросить состояние.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Перезапустить приложение
          </button>
        </div>
      </body>
    </html>
  )
}
