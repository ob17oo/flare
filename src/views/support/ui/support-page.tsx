'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { InputComponent, ButtonComponent } from "@/shared/components"
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Send, 
  Paperclip, 
  ChevronRight, 
  AlertCircle, 
  X,
  FileText,
  User,
  ShieldCheck
} from "lucide-react"

// Types
interface Ticket {
  id: string
  subject: string
  category: 'PAYMENT' | 'ORDER' | 'BALANCE' | 'REFUND' | 'BUG' | 'ACCOUNT' | 'OTHER'
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_USER' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  _count?: {
    messages: number
  }
}

interface Message {
  id: string
  text: string
  senderId: string
  isAdmin: boolean
  createdAt: string
}

interface Attachment {
  id: string
  fileUrl: string
  fileName: string
  fileSize: number
  createdAt: string
}

interface TicketDetail {
  ticket: Ticket & { attachments: Attachment[] }
  messages: Message[]
}

const ticketSchema = z.object({
  subject: z.string().min(4, "Тема должна содержать минимум 4 символа"),
  category: z.enum(["PAYMENT", "ORDER", "BALANCE", "REFUND", "BUG", "ACCOUNT", "OTHER"]),
  text: z.string().min(10, "Опишите вашу проблему подробнее (минимум 10 символов)")
})

type TicketFormData = z.infer<typeof ticketSchema>

const CATEGORY_MAP: Record<string, string> = {
  PAYMENT: 'Проблема с оплатой',
  ORDER: 'Проблема с заказом',
  BALANCE: 'Проблема с балансом',
  REFUND: 'Возврат средств',
  BUG: 'Ошибка сайта',
  ACCOUNT: 'Аккаунт',
  OTHER: 'Другое'
}

const STATUS_MAP: Record<string, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  AWAITING_USER: 'Ожидает ответа',
  RESOLVED: 'Решен',
  CLOSED: 'Закрыт'
}

export function SupportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()

  const activeTicketId = searchParams.get('ticketId')
  const [isCreating, setIsCreating] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [attachments, setAttachments] = useState<{ fileName: string; fileSize: number; fileUrl: string }[]>([])

  // Forms
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema)
  })

  // React Query: Fetch all tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await fetch('/api/support/tickets')
      if (!res.ok) throw new Error('Failed to fetch tickets')
      return res.json()
    },
    enabled: status === 'authenticated'
  })

  // React Query: Fetch dynamic details for the active ticket
  const { data: ticketDetails, isLoading: detailsLoading } = useQuery<TicketDetail>({
    queryKey: ['support-ticket-details', activeTicketId],
    queryFn: async () => {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch ticket messages')
      return res.json()
    },
    enabled: !!activeTicketId && status === 'authenticated',
    refetchInterval: 10000 // Poll every 10 seconds for real-time admin responses
  })

  // Mutations: Create Ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData & { attachments?: typeof attachments }) => {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create ticket')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
      setIsCreating(false)
      reset()
      setAttachments([])
      router.push(`/support?ticketId=${data.ticketId}`)
    }
  })

  // Mutations: Reply to Ticket
  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/support/tickets/${activeTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('Failed to reply')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket-details', activeTicketId] })
      setReplyText('')
    }
  })

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate({
      ...data,
      attachments
    })
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    replyMutation.mutate(replyText.trim())
  }

  // Simulated File Upload handler
  const simulateAttachment = () => {
    const fileNames = ['screenshot_payment_error.png', 'receipt_payment_stripe.pdf', 'system_error_log.txt']
    const randomName = fileNames[Math.floor(Math.random() * fileNames.length)] ?? 'screenshot_payment_error.png'
    const randomSize = Math.floor(Math.random() * 5 * 1024 * 1024) + 1024 // 1KB to 5MB

    const newAttachment = {
      fileName: randomName,
      fileSize: randomSize,
      fileUrl: `https://mockfiles.flare.com/uploads/${Date.now()}_${randomName}`
    }

    setAttachments(prev => [...prev, newAttachment])
  }

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-lg text-[var(--text-secondary)]">Загрузка...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="max-w-[480px] mx-auto py-20 text-center flex flex-col gap-4">
        <h2 className="text-h3 font-bold text-error">Необходима авторизация</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">Пожалуйста, войдите в свой аккаунт, чтобы просматривать или создавать тикеты поддержки.</p>
        <ButtonComponent onClick={() => router.push('/login')} color="accent" isFilled className="mx-auto px-8 py-3 mt-2">
          Войти в аккаунт
        </ButtonComponent>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 flex flex-col gap-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-muted)]/60 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            Служба поддержки
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Создавайте обращения по техническим или финансовым вопросам и общайтесь с модераторами
          </p>
        </div>
        {!isCreating && !activeTicketId && (
          <ButtonComponent
            onClick={() => setIsCreating(true)}
            color="accent"
            isFilled
            className="flex items-center gap-2 px-5 py-2.5 shrink-0"
          >
            <Plus size={16} />
            Создать тикет
          </ButtonComponent>
        )}
        {(isCreating || activeTicketId) && (
          <button
            onClick={() => {
              setIsCreating(false)
              router.push('/support')
            }}
            className="text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5 bg-[var(--secondary)] border border-[var(--border-muted)] px-4 py-2.5 rounded-xl transition-all"
          >
            Назад к списку
          </button>
        )}
      </div>

      {/* Main Section */}
      {isCreating ? (
        // Ticket Creation view
        <div className="max-w-xl mx-auto w-full bg-[var(--secondary)] border border-[var(--border-muted)] p-6 rounded-2xl shadow-[var(--card-shadow)]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] border-b border-[var(--border-muted)] pb-2.5">
              Создание обращения
            </h2>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Категория проблемы</label>
              <select
                {...register('category')}
                className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-4 py-3 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <option value="PAYMENT">Проблема с оплатой</option>
                <option value="ORDER">Проблема с заказом</option>
                <option value="BALANCE">Проблема с балансом</option>
                <option value="REFUND">Возврат средств</option>
                <option value="BUG">Ошибка сайта</option>
                <option value="ACCOUNT">Аккаунт</option>
                <option value="OTHER">Другое</option>
              </select>
              {errors.category && (
                <p className="text-[11px] text-[var(--error)] font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Тема обращения</label>
              <InputComponent
                {...register('subject')}
                type="text"
                placeholder="Например: Не зачислился платеж с карты"
                sizeVariant="default"
              />
              {errors.subject && (
                <p className="text-[11px] text-[var(--error)] font-medium">{errors.subject.message}</p>
              )}
            </div>

            {/* Message Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Описание проблемы</label>
              <textarea
                {...register('text')}
                placeholder="Подробно расскажите о возникшей проблеме..."
                rows={6}
                className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-4 py-3 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              />
              {errors.text && (
                <p className="text-[11px] text-[var(--error)] font-medium">{errors.text.message}</p>
              )}
            </div>

            {/* Attachments */}
            <div className="flex flex-col gap-2.5 border-t border-[var(--border-muted)]/60 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Прикрепленные файлы</span>
                <button
                  type="button"
                  onClick={simulateAttachment}
                  className="text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Paperclip size={12} />
                  Прикрепить файл
                </button>
              </div>

              {attachments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[var(--bg-layer-2)] border border-[var(--border-muted)] px-3 py-2 rounded-xl text-[12px]">
                      <span className="flex items-center gap-2 text-[var(--text-primary)] font-medium truncate">
                        <FileText size={14} className="text-[var(--text-secondary)] shrink-0" />
                        {att.fileName}
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          ({(att.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-[var(--text-secondary)] hover:text-red-500 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-[var(--text-secondary)] italic">Файлы не прикреплены</span>
              )}
            </div>

            {createTicketMutation.isError && (
              <div className="p-3 bg-red-500/5 text-[var(--error)] text-[12px] font-medium border border-red-500/10 rounded-xl text-center">
                {createTicketMutation.error?.message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className={`w-full h-11 flex items-center justify-center font-bold text-[13px] rounded-xl transition-all active:scale-[0.99] mt-2 ${
                createTicketMutation.isPending
                  ? 'bg-[var(--bg-layer-3)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-muted)] opacity-60'
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer shadow-sm'
              }`}
            >
              {createTicketMutation.isPending ? 'Создание...' : 'Отправить тикет'}
            </button>
          </form>
        </div>
      ) : activeTicketId ? (
        // Ticket Detailed Conversation Thread View
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Ticket Stats Sidebar */}
          {detailsLoading ? (
            <div className="h-40 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl">
              <span className="text-[12px] text-[var(--text-secondary)]">Загрузка информации...</span>
            </div>
          ) : ticketDetails ? (
            <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)] flex flex-col gap-4">
              <div className="flex flex-col gap-1 border-b border-[var(--border-muted)] pb-3">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Номер тикета</span>
                <span className="font-mono text-[12px] font-bold text-[var(--text-primary)] truncate" title={ticketDetails.ticket.id}>
                  {ticketDetails.ticket.id}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Тема</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
                  {ticketDetails.ticket.subject}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Категория</span>
                <span className="text-[12px] font-medium text-[var(--text-primary)]">
                  {CATEGORY_MAP[ticketDetails.ticket.category]}
                </span>
              </div>

              <div className="flex flex-col gap-1 border-t border-[var(--border-muted)]/60 pt-3">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Статус</span>
                <span className={`inline-block w-fit text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  ticketDetails.ticket.status === 'RESOLVED' || ticketDetails.ticket.status === 'CLOSED'
                    ? 'bg-green-500/5 text-[var(--success)] border-green-500/10'
                    : ticketDetails.ticket.status === 'AWAITING_USER'
                    ? 'bg-orange-500/5 text-orange-500 border-orange-500/10'
                    : 'bg-blue-500/5 text-[var(--accent)] border-blue-500/10'
                }`}>
                  {STATUS_MAP[ticketDetails.ticket.status]}
                </span>
              </div>

              {ticketDetails.ticket.attachments.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-[var(--border-muted)]/60 pt-3">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Файлы ({ticketDetails.ticket.attachments.length})</span>
                  <div className="flex flex-col gap-1.5">
                    {ticketDetails.ticket.attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1.5 truncate"
                      >
                        <FileText size={12} className="shrink-0" />
                        {att.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Chat Messages Panel */}
          <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-[var(--card-shadow)] flex flex-col h-[540px]">
            {/* Header info */}
            <div className="px-6 py-4 border-b border-[var(--border-muted)]/60 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[13px] font-bold text-[var(--text-primary)]">История диалога поддержки</span>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {detailsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[12px] text-[var(--text-secondary)]">Загрузка диалога...</span>
                </div>
              ) : ticketDetails ? (
                ticketDetails.messages.map((msg) => {
                  const isUser = !msg.isAdmin
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[80%] ${
                        isUser ? 'self-end flex-row-reverse' : 'self-start'
                      }`}
                    >
                      {/* Avatar */}
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-muted)] shrink-0 bg-[var(--bg-layer-2)]`}>
                        {isUser ? <User size={14} /> : <ShieldCheck size={14} className="text-[var(--accent)]" />}
                      </span>

                      {/* Msg bubble */}
                      <div className="flex flex-col gap-1">
                        <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed break-words whitespace-pre-wrap ${
                          isUser
                            ? 'bg-[var(--accent)] text-white rounded-tr-none'
                            : 'bg-[var(--bg-layer-2)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-muted)]'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[10px] text-[var(--text-secondary)] px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleDateString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[12px] text-[var(--text-secondary)]">Сообщений пока нет</span>
                </div>
              )}
            </div>

            {/* Reply Input panel */}
            {ticketDetails?.ticket && ticketDetails.ticket.status !== 'CLOSED' && (
              <form onSubmit={handleReplySubmit} className="p-4 border-t border-[var(--border-muted)]/60 bg-[var(--bg-layer-2)]/20 flex gap-2 items-center">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите ответ..."
                  disabled={replyMutation.isPending}
                  className="flex-1 h-11 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-4 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl text-white transition-all duration-200 shrink-0 ${
                    replyMutation.isPending || !replyText.trim()
                      ? 'bg-[var(--bg-layer-3)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-muted)]'
                      : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer'
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>
            )}
            {ticketDetails?.ticket && ticketDetails.ticket.status === 'CLOSED' && (
              <div className="p-4 border-t border-[var(--border-muted)]/60 bg-[var(--bg-layer-3)]/40 text-center text-[12px] text-[var(--text-secondary)] font-medium">
                Этот тикет закрыт модератором. Вы больше не можете отправлять в него сообщения.
              </div>
            )}
          </div>
        </div>
      ) : (
        // Ticket listings index view
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-[var(--card-shadow)] p-6">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)]/60 pb-4 mb-4">
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--text-secondary)]" />
              Ваши обращения в поддержку
            </h2>
            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
              Всего обращений: {tickets.length}
            </span>
          </div>

          {ticketsLoading ? (
            <div className="py-12 text-center">
              <span className="text-[13px] text-[var(--text-secondary)]">Загрузка обращений...</span>
            </div>
          ) : tickets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/support?ticketId=${t.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--bg-layer-2)]/30 hover:bg-[var(--bg-layer-2)]/60 border border-[var(--border-muted)] hover:border-[var(--accent)]/40 px-5 py-4 rounded-xl transition-all duration-200 cursor-pointer gap-4"
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-[var(--text-primary)] truncate max-w-full">
                        {t.subject}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] bg-[var(--bg-layer-3)] px-1.5 py-0.5 rounded border border-[var(--border-muted)] shrink-0">
                        {CATEGORY_MAP[t.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Создан: {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      {t._count && (
                        <span>Сообщений: {t._count.messages}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-[var(--border-muted)]/40 pt-3 sm:border-none sm:pt-0">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-green-500/5 text-[var(--success)] border-green-500/10'
                        : t.status === 'AWAITING_USER'
                        ? 'bg-orange-500/5 text-orange-500 border-orange-500/10'
                        : 'bg-blue-500/5 text-[var(--accent)] border-blue-500/10'
                    }`}>
                      {STATUS_MAP[t.status]}
                    </span>
                    <ChevronRight size={16} className="text-[var(--text-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-[var(--border-muted)] rounded-xl flex flex-col gap-3 items-center justify-center">
              <AlertCircle size={24} className="text-[var(--text-secondary)]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-semibold text-[var(--text-primary)]">Обращений не найдено</span>
                <span className="text-[12px] text-[var(--text-secondary)]">Если у вас возникла проблема, создайте новое обращение в поддержку</span>
              </div>
              <ButtonComponent
                onClick={() => setIsCreating(true)}
                color="accent"
                isFilled
                className="flex items-center gap-1.5 px-4 py-2 mt-2 text-[12px]"
              >
                <Plus size={14} />
                Создать обращение
              </ButtonComponent>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
