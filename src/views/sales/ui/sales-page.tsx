'use client';

import { useQuery } from '@tanstack/react-query';
import { CardComponent } from '@/shared/components';
import { Loader2, Percent, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function SalesPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['sales-discounted-products'],
    queryFn: async () => {
      const res = await fetch('/api/products/discounts');
      if (!res.ok) throw new Error('Failed to fetch discounted products');
      return res.json() as Promise<{
        games: any[];
        subscriptions: any[];
        wallets: any[];
      }>;
    },
    staleTime: 30 * 1000 // 30 seconds stale time
  });

  const hasItems = data && (
    (data.games && data.games.length > 0) ||
    (data.subscriptions && data.subscriptions.length > 0) ||
    (data.wallets && data.wallets.length > 0)
  );

  return (
    <section className="flex flex-col gap-8 py-6 min-h-[70vh]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-muted)] pb-5">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Percent className="w-8 h-8 text-[var(--accent)]" />
            Скидки и акции
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1.5">
            Самые выгодные предложения на игры, подписки и пополнение кошельков
          </p>
        </div>
        
        {/* Refresh button */}
        {hasItems && (
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-xl text-[13px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-[var(--accent)]' : ''}`} />
            <span>Обновить</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" />
          <p className="text-[14px] text-[var(--text-secondary)]">Загружаем товары со скидками...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-sm">
          <p className="text-red-500 font-semibold text-lg">Не удалось загрузить товары со скидками</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Попробовать снова
          </button>
        </div>
      ) : !hasItems ? (
        <div className="text-center py-28 bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-sm max-w-2xl mx-auto flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] flex items-center justify-center text-[var(--text-secondary)]">
            <Percent className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Сейчас активных акций нет</h2>
            <p className="text-[14px] text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
              Следите за обновлениями! Новые скидки и выгодные предложения появляются регулярно.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-[var(--bg-layer-2)] border border-[var(--border-muted)] hover:border-white/20 text-white font-semibold rounded-xl text-[13px] transition-colors cursor-pointer"
          >
            Проверить снова
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Category: Games */}
          {data.games && data.games.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--border-muted)] pb-2.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">🎮 Игры</span>
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {data.games.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-max">
                {data.games.map((item: any) => (
                  <Link key={item.id} href={item.url} className="block h-full">
                    <CardComponent item={item} sizeVariant="default" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category: Subscriptions */}
          {data.subscriptions && data.subscriptions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--border-muted)] pb-2.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">⭐ Подписки и Услуги</span>
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {data.subscriptions.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-max">
                {data.subscriptions.map((item: any) => (
                  <Link key={item.id} href={item.url} className="block h-full">
                    <CardComponent item={item} sizeVariant="default" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category: Wallets */}
          {data.wallets && data.wallets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--border-muted)] pb-2.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">💳 Пополнение кошельков</span>
                <span className="bg-[var(--accent)]/15 text-[var(--accent)] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {data.wallets.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-max">
                {data.wallets.map((item: any) => (
                  <Link key={item.id} href={item.url} className="block h-full">
                    <CardComponent item={item} sizeVariant="default" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}