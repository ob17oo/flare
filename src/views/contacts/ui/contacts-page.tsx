'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { InputComponent, ButtonComponent } from "@/shared/components"
import { Mail, MessageCircle, HelpCircle, Clock, Send, CheckCircle2, ShieldCheck } from "lucide-react"

const feedbackSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  subject: z.string().min(3, "Тема должна содержать минимум 3 символа"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов")
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

export function ContactsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    mode: 'onTouched'
  })

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true)
      setErrorMsg('')

      const res = await fetch('/api/contacts/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setSuccess(true)
        reset()
      } else {
        setErrorMsg(result.error || 'Не удалось отправить сообщение')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Произошла непредвиденная ошибка при отправке')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-[960px] mx-auto py-10 flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2 text-center max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-bold tracking-tight text-[var(--text-primary)]">
          Контакты
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Свяжитесь с нашей командой поддержки напрямую или отправьте обращение через форму обратной связи
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-8 items-start">
        {/* Support Channels Card */}
        <div className="flex flex-col gap-5 bg-[var(--secondary)] border border-[var(--border-muted)] p-6 rounded-2xl shadow-[var(--card-shadow)]">
          <h2 className="text-[16px] font-bold text-[var(--text-primary)] border-b border-[var(--border-muted)] pb-2 uppercase tracking-wide text-[11px] text-[var(--text-secondary)]">
            Каналы связи
          </h2>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex gap-3 items-start">
              <span className="p-2.5 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[var(--accent)] shrink-0">
                <Mail size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Email поддержка</span>
                <a href="mailto:support@flare.com" className="text-[13px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                  support@flare.com
                </a>
              </div>
            </div>

            {/* Telegram */}
            <div className="flex gap-3 items-start">
              <span className="p-2.5 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[#229ED9] shrink-0">
                <MessageCircle size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Telegram канал</span>
                <a href="https://t.me/flare_support" target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                  @flare_support
                </a>
              </div>
            </div>

            {/* Discord */}
            <div className="flex gap-3 items-start">
              <span className="p-2.5 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[#5865F2] shrink-0">
                <HelpCircle size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Discord сервер</span>
                <a href="https://discord.gg/flare" target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                  discord.gg/flare
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div className="flex gap-3 items-start border-t border-[var(--border-muted)]/60 pt-4 mt-2">
              <span className="p-2.5 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[var(--success)] shrink-0">
                <Clock size={16} />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Время работы</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">
                  24 / 7 / 365
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">Отвечаем в течение 10-15 минут</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form Card */}
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-6 rounded-2xl shadow-[var(--card-shadow)]">
          {success ? (
            <div className="py-10 text-center flex flex-col items-center gap-4 animate-scale-in">
              <span className="w-12 h-12 rounded-full bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center border border-[var(--success)]/20 shadow-inner">
                <CheckCircle2 size={24} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[18px] font-bold text-[var(--text-primary)]">Сообщение отправлено!</h3>
                <p className="text-[12px] text-[var(--text-secondary)] max-w-sm mx-auto">
                  Спасибо за обращение. Мы изучим ваше сообщение и ответим на указанный email в течение ближайшего времени.
                </p>
              </div>
              <ButtonComponent onClick={() => setSuccess(false)} color="secondary" isFilled className="px-6 py-2 mt-2">
                Отправить еще раз
              </ButtonComponent>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <h2 className="text-[15px] font-bold text-[var(--text-primary)] border-b border-[var(--border-muted)] pb-2.5">
                Форма обратной связи
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваше имя</label>
                  <InputComponent
                    {...register('name')}
                    type="text"
                    placeholder="Алексей"
                    sizeVariant="default"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-[var(--error)] font-medium" role="alert">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваш Email</label>
                  <InputComponent
                    {...register('email')}
                    type="email"
                    placeholder="alexey@email.com"
                    sizeVariant="default"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-[var(--error)] font-medium" role="alert">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Тема обращения</label>
                <InputComponent
                  {...register('subject')}
                  type="text"
                  placeholder="Сотрудничество, вопрос по заказам..."
                  sizeVariant="default"
                />
                {errors.subject && (
                  <p className="text-[11px] text-[var(--error)] font-medium" role="alert">{errors.subject.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Сообщение</label>
                <textarea
                  {...register('message')}
                  placeholder="Подробно опишите суть вашего обращения..."
                  rows={5}
                  className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-4 py-3 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-[11px] text-[var(--error)] font-medium" role="alert">{errors.message.message}</p>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/5 text-[var(--error)] text-[12px] font-medium rounded-xl border border-red-500/10 text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] transition-all duration-200 active:scale-[0.99] mt-2 ${
                  isSubmitting
                    ? 'bg-[var(--bg-layer-3)] text-[var(--text-secondary)] cursor-not-allowed opacity-60 border border-[var(--border-muted)]'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer shadow-sm'
                }`}
              >
                {isSubmitting ? 'Отправка...' : (
                  <>
                    <Send size={14} />
                    Отправить сообщение
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
