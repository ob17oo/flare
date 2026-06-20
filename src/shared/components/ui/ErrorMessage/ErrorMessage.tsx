import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null

  return (
    <div 
      className={`flex items-start gap-2.5 p-3.5 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-xs font-medium leading-relaxed ${className || ''}`} 
      role="alert"
    >
      <AlertCircle size={15} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
    </div>
  )
}
