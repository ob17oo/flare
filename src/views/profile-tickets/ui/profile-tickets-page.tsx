'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Key, Copy, Check, ArrowLeft, Ticket as TicketIcon } from "lucide-react"

interface TTicketProduct {
  title: string
  image_url: string
}

interface TTicketOrder {
  id: number
  price: number
  createdAt: string
  product: TTicketProduct | null
}

interface TDigitalTicket {
  id: string
  productKey: string
  createdAt: string
  order: TTicketOrder | null
}

export function ProfileTicketsPage() {
  const router = useRouter()
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  const { data: tickets = [], isLoading } = useQuery<TDigitalTicket[]>({
    queryKey: ['user-digital-tickets'],
    queryFn: async () => {
      const res = await fetch('/api/profile/tickets')
      if (!res.ok) throw new Error('Failed to fetch digital tickets')
      return res.json()
    }
  })

  const handleCopyKey = (key: string, ticketId: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKeyId(ticketId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/profile')} 
            className="p-2 rounded-xl bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30 transition-all cursor-pointer"
            title="Назад в профиль"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[20px] font-extrabold text-[var(--text-primary)] flex items-center gap-2.5">
              <Key className="text-[var(--accent)]" size={20} />
              Цифровые ключи и товары
            </h1>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Список всех ваших купленных лицензионных ключей</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-16 text-center shadow-[var(--card-shadow)]">
          <span className="text-[14px] text-[var(--text-secondary)]">Загрузка ваших цифровых товаров...</span>
        </div>
      ) : tickets.length > 0 ? (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => {
            const isCopied = copiedKeyId === ticket.id
            const orderDate = ticket.order?.createdAt 
              ? new Date(ticket.order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Неизвестно'

            return (
              <div 
                key={ticket.id} 
                className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-5 shadow-[var(--card-shadow)] flex flex-col md:flex-row md:items-center gap-5 hover:border-[var(--text-secondary)]/10 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="w-16 h-16 rounded-xl bg-[var(--bg-layer-0)] border border-[var(--border-muted)] relative overflow-hidden shrink-0">
                  {ticket.order?.product?.image_url ? (
                    <Image src={ticket.order.product.image_url} alt="Product Image" fill className="object-cover" />
                  ) : (
                    <TicketIcon className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  )}
                </div>

                {/* Product & Order Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] truncate">
                    {ticket.order?.product?.title || 'Цифровой товар'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-[11px] text-[var(--text-secondary)] font-medium">
                    <span>Заказ: <strong className="text-[var(--text-primary)]">#{ticket.order?.id}</strong></span>
                    <span>Дата покупки: <strong>{orderDate}</strong></span>
                    <span>Статус: <strong className="text-[var(--success)]">Оплачено</strong></span>
                  </div>
                </div>

                {/* Key Display & Copy Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 mt-2 md:mt-0">
                  <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-4 py-3 flex items-center justify-between gap-3 font-mono text-[14px] font-bold text-[var(--text-primary)] tracking-wider">
                    <span>{ticket.productKey}</span>
                  </div>
                  <button
                    onClick={() => handleCopyKey(ticket.productKey, ticket.id)}
                    className={`px-4 py-3 rounded-xl border font-bold text-[13px] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      isCopied
                        ? 'bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]'
                        : 'bg-[var(--bg-layer-3)] border-[var(--border-muted)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30 hover:bg-[var(--bg-layer-4)]'
                    }`}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    {isCopied ? 'Скопирован' : 'Скопировать ключ'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-12 text-center shadow-[var(--card-shadow)] flex flex-col items-center justify-center gap-4">
          <TicketIcon size={32} className="text-[var(--text-secondary)] opacity-60" />
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold text-[var(--text-primary)]">У вас пока нет купленных цифровых товаров</span>
            <span className="text-[12px] text-[var(--text-secondary)]">После успешной оплаты Stripe ваши цифровые ключи появятся на этой странице</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
          >
            Перейти в каталог
          </button>
        </div>
      )}
    </div>
  )
}
