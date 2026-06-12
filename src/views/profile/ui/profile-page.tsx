'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ButtonComponent, InputComponent } from "@/shared/components"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  LifeBuoy, 
  Plus, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  ChevronRight 
} from "lucide-react"

interface ProfileProps {
  session: Session
}

const CATEGORY_MAP: Record<string, string> = {
  PAYMENT: 'Оплата',
  ORDER: 'Заказ',
  BALANCE: 'Баланс',
  REFUND: 'Возврат',
  BUG: 'Ошибка',
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

export function ProfilePage({ session }: ProfileProps) {
  const router = useRouter()
  const { user } = session
  const [activeTab, setActiveTab] = useState<'dashboard' | 'support'>('dashboard')

  // Fetch tickets for support tab
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<any[]>({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const res = await fetch('/api/support/tickets')
      if (!res.ok) throw new Error('Failed to fetch tickets')
      return res.json()
    },
    enabled: activeTab === 'support'
  })

  return (
    <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mt-6 py-4">
      {/* Sidebar Profile Card */}
      <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col items-center gap-6 p-6 shadow-[var(--card-shadow)] h-fit">
        <div className="w-24 h-24 rounded-full border-2 border-[var(--border-muted)] relative overflow-hidden bg-[var(--bg-layer-0)]">
          <Image className="object-cover" fill src={user.image_url} alt={`User Image ${user.login}`} />
        </div>
        <div className="w-full flex flex-col gap-4">
          <div>
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Логин</span>
            <p className="font-bold text-[16px] text-[var(--text-primary)] mt-0.5">{user.login}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Электронная почта</span>
            <p className="font-bold text-[14px] text-[var(--text-primary)] mt-0.5 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full border-t border-[var(--border-muted)]/60 pt-4 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutDashboard size={16} />
            Главная панель
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[var(--bg-layer-2)] border border-[var(--border-muted)] text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LifeBuoy size={16} />
            Мои тикеты
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full mt-2 border-t border-[var(--border-muted)]/60 pt-4">
          <ButtonComponent isFilled={true} color="secondary" className="w-full py-2.5">Редактировать</ButtonComponent>
          <ButtonComponent onClick={() => signOut()} isFilled={true} color="accent" className="w-full py-2.5">Выйти</ButtonComponent>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === 'dashboard' ? (
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl flex flex-col gap-6 p-6 shadow-[var(--card-shadow)] h-fit">
          {/* Balance Block */}
          <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваш текущий баланс</span>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-[20px] font-extrabold text-[var(--text-primary)]">{user.balance.toLocaleString('ru-RU')} ₽</p>
              <ButtonComponent onClick={() => router.push('/balance/topup')} color="success" isFilled={true} className="py-2 px-5">Пополнить баланс</ButtonComponent>
            </div>
          </div>

          {/* Discount Progress Block */}
          <div className="flex flex-col gap-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] p-5 rounded-xl">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ваша персональная скидка</span>
            <div className="flex flex-col mt-2">
              <div className="w-full h-2.5 rounded-full bg-[var(--bg-layer-0)] border border-[var(--border-muted)] relative overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${Math.min((user.discount / user.maxUserDiscount) * 100, 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[12px] text-[var(--text-secondary)]">Текущая скидка</span>
                <span className="text-[13px] font-bold text-[var(--accent)]">{user.discount}% / {user.maxUserDiscount}%</span>
              </div>
            </div>
          </div>

          {/* Account Stats & Creator Support Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-5 flex flex-col gap-4">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2">Статистика аккаунта</h3>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Всего потрачено</span>
                <p className="text-[20px] font-extrabold text-[var(--accent)]">{user.spent.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Выполнено заказов</span>
                <p className="text-[14px] font-bold text-[var(--text-primary)]">История покупок пуста</p>
              </div>
            </div>

            {/* Support Creator */}
            <div className="bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl p-5 flex flex-col gap-4 justify-between">
              <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Поддержка авторов</h3>
                <button className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer" type="button" title="Информация">?</button>
              </div>

              <div className="flex flex-col gap-3">
                <InputComponent sizeVariant="default" placeholder="Никнейм автора" />
                <ButtonComponent isFilled={true} color="accent" className="w-full py-2.5">Поддержать автора</ButtonComponent>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Support Tickets List Tab
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-5 h-fit">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)]/60 pb-3">
            <h2 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--text-secondary)]" />
              Мои обращения в поддержку
            </h2>
            {tickets.length > 0 && (
              <ButtonComponent
                onClick={() => router.push('/support')}
                color="accent"
                isFilled
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
              >
                <Plus size={12} />
                Создать тикет
              </ButtonComponent>
            )}
          </div>

          {ticketsLoading ? (
            <div className="py-10 text-center">
              <span className="text-[12px] text-[var(--text-secondary)]">Загрузка обращений...</span>
            </div>
          ) : tickets.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/support?ticketId=${t.id}`)}
                  className="flex items-center justify-between bg-[var(--bg-layer-2)]/30 hover:bg-[var(--bg-layer-2)]/60 border border-[var(--border-muted)] px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-[13px]"
                >
                  <div className="flex flex-col gap-1 truncate pr-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-[var(--text-primary)] truncate">{t.subject}</span>
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] bg-[var(--bg-layer-3)] px-1.5 py-0.5 rounded border border-[var(--border-muted)] shrink-0">
                        {CATEGORY_MAP[t.category]}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                      Создан: {new Date(t.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-green-500/5 text-[var(--success)] border-green-500/10'
                        : t.status === 'AWAITING_USER'
                        ? 'bg-orange-500/5 text-orange-500 border-orange-500/10'
                        : 'bg-blue-500/5 text-[var(--accent)] border-blue-500/10'
                    }`}>
                      {STATUS_MAP[t.status]}
                    </span>
                    <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center border border-dashed border-[var(--border-muted)] rounded-xl flex flex-col gap-3 items-center justify-center">
              <AlertCircle size={20} className="text-[var(--text-secondary)]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">История тикетов пуста</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Если у вас возникла техническая проблема, вы можете задать вопрос нашей поддержке</span>
              </div>
              <ButtonComponent
                onClick={() => router.push('/support')}
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
    </section>
  )
}