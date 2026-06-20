'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CardComponent } from '@/shared/components';
import { Loader2, Filter, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';
import { TPaymentItem } from '@/features/Payment/model/types';

interface RawSearchItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  price: number;
  url: string;
  launcher?: string;
  provider?: string;
  discountPercent?: number;
  productType: 'GAME' | 'WALLET' | 'SERVICE_PLANS';
}

type TSearchItem = TPaymentItem & {
  url: string;
  categoryKey: string;
  categoryLabel: string;
  launcher?: string;
  provider?: string;
  discountPercent?: number;
};

export function SearchPageView() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  // Filter States
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    games: true,
    subscriptions: true,
    wallets: true
  });
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');

  // Fetch unified search results
  const { data, isLoading, isError } = useQuery<{
    games: RawSearchItem[];
    subscriptions: RawSearchItem[];
    wallets: RawSearchItem[];
  }>({
    queryKey: ['global-search-page-results', q],
    queryFn: async () => {
      if (!q.trim()) return { games: [], subscriptions: [], wallets: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Search request failed');
      return res.json();
    },
    enabled: q.trim().length > 0,
    staleTime: 60 * 1000
  });

  // Flat list of unified items
  const allItems = useMemo<TSearchItem[]>(() => {
    if (!data) return [];
    return [
      ...(data.games || []).map((item: RawSearchItem) => ({ ...item, categoryKey: 'games', categoryLabel: 'Игры' } as unknown as TSearchItem)),
      ...(data.subscriptions || []).map((item: RawSearchItem) => ({ ...item, categoryKey: 'subscriptions', categoryLabel: 'Подписки' } as unknown as TSearchItem)),
      ...(data.wallets || []).map((item: RawSearchItem) => ({ ...item, categoryKey: 'wallets', categoryLabel: 'Пополнение' } as unknown as TSearchItem))
    ];
  }, [data]);

  // Derived filters information
  const platformsList = useMemo(() => {
    const list = allItems
      .map((item) => item.launcher || item.provider)
      .filter((platform): platform is string => !!platform);
    return ['All', ...new Set(list)];
  }, [allItems]);

  // Determine dynamic price range limits
  const priceLimits = useMemo(() => {
    if (allItems.length === 0) return { min: 0, max: 0 };
    const prices = allItems.map((item) => item.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [allItems]);

  // Filtered & Sorted items to display
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        // Category Filter
        if (!categoryFilters[item.categoryKey]) return false;

        // Price Filter
        if (minPrice !== '' && item.price < Number(minPrice)) return false;
        if (maxPrice !== '' && item.price > Number(maxPrice)) return false;

        // Platform Filter
        if (selectedPlatform !== 'All') {
          const itemPlatform = (item.launcher || item.provider || '').toLowerCase();
          if (itemPlatform !== selectedPlatform.toLowerCase()) return false;
        }

        // Sale / Discount filter
        if (onlyDiscounted && (item.discountPercent || 0) === 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
        return 0; // Default sorted by relevance
      });
  }, [allItems, categoryFilters, minPrice, maxPrice, selectedPlatform, onlyDiscounted, sortBy]);

  const toggleCategory = (key: string) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetFilters = () => {
    setCategoryFilters({ games: true, subscriptions: true, wallets: true });
    setMinPrice('');
    setMaxPrice('');
    setSelectedPlatform('All');
    setOnlyDiscounted(false);
    setSortBy('default');
  };

  return (
    <section className="flex flex-col gap-6 py-4 min-h-[60vh]">
      {/* Title Header */}
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
          Результаты поиска
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">
          {q.trim() ? (
            <>
              Найдено {filteredItems.length} товаров по запросу &quot;
              <span className="text-white font-semibold">{q}</span>&quot;
            </>
          ) : (
            'Введите поисковый запрос в шапке...'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        
        {/* Filters Sidebar */}
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl h-fit flex flex-col gap-6 shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-3">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-[14px]">
              <Filter className="w-4 h-4 text-[var(--accent)]" />
              <span>Фильтры</span>
            </div>
            <button 
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[var(--accent)] hover:text-white transition-colors cursor-pointer"
            >
              Сбросить
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Категория</h4>
            <div className="space-y-2.5">
              {[
                { key: 'games', label: '🎮 Игры' },
                { key: 'subscriptions', label: '⭐ Подписки' },
                { key: 'wallets', label: '💳 Пополнение кошельков' }
              ].map((cat) => (
                <label key={cat.key} className="flex items-center gap-3 cursor-pointer select-none group">
                  <div 
                    onClick={() => toggleCategory(cat.key)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      categoryFilters[cat.key] 
                        ? 'bg-[var(--accent)] border-transparent text-white' 
                        : 'border-[var(--border-muted)] group-hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    {categoryFilters[cat.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform / Launcher Filter */}
          {platformsList.length > 2 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Платформа / Лаунчер</h4>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {platformsList.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform === 'All' ? 'Все платформы' : platform}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">Цена, ₽</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`от ${priceLimits.min}`}
                className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--accent)] transition-colors"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`до ${priceLimits.max}`}
                className="w-full bg-[var(--bg-layer-2)] border border-[var(--border-muted)] rounded-xl px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Discounts / Sale Only */}
          <div className="pt-2 border-t border-[var(--border-muted)]">
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div 
                onClick={() => setOnlyDiscounted(!onlyDiscounted)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  onlyDiscounted 
                    ? 'bg-[var(--accent)] border-transparent text-white' 
                    : 'border-[var(--border-muted)] group-hover:border-[var(--text-secondary)]'
                }`}
              >
                {onlyDiscounted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Только со скидкой
              </span>
            </label>
          </div>
        </div>

        {/* Results Main Area */}
        <div className="space-y-6">
          {/* Sorting & Filter Header Row */}
          <div className="flex items-center justify-between bg-[var(--secondary)] border border-[var(--border-muted)] px-5 py-3 rounded-2xl shadow-[var(--card-shadow)]">
            <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Сортировка:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[13px] text-[var(--text-primary)] font-semibold outline-none cursor-pointer border-none"
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешевые</option>
              <option value="price-desc">Сначала дорогие</option>
              <option value="discount">По величине скидки</option>
            </select>
          </div>

          {/* Loader or Error or Items Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
              <p className="text-[14px] text-[var(--text-secondary)]">Загружаем подходящие товары...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 font-semibold">
              Не удалось загрузить результаты поиска. Пожалуйста, перезагрузите страницу.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24 bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl shadow-sm">
              <p className="text-lg font-bold text-white mb-2">Ничего не найдено</p>
              <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto">
                Попробуйте изменить поисковый запрос или сбросить фильтры поиска.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
              {filteredItems.map((item) => (
                <Link key={item.id} href={item.url} className="block h-full">
                  <CardComponent item={item} sizeVariant="default" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
