'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to the server console via action or just console error locally
    console.error('Next.js Route Error Boundary caught exception:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-inner shrink-0">
          <AlertCircle size={32} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
            Что-то пошло не так
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Произошла критическая ошибка при обработке этой страницы. Наша команда поддержки уже работает над её устранением.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full mt-2 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw size={15} />
            Попробовать снова
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-layer-4)] hover:border-[var(--text-secondary)]/30 text-[14px] font-semibold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Home size={15} />
            На главную
          </a>
        </div>
      </div>
    </div>
  )
}
