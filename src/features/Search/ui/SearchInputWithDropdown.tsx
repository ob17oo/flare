'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';

// Reusable debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DropdownSearchItem {
  id: number;
  title: string;
  price: number;
  image_url: string;
  productType: string;
  productEdition: string;
  tags: string[];
  discountPercent: number;
  oldPrice: number;
  launcher: string | null;
  provider: string | null;
  url: string;
  categoryLabel?: string;
}

export function SearchInputWithDropdown() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results from API using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async (): Promise<{ games: DropdownSearchItem[]; subscriptions: DropdownSearchItem[]; wallets: DropdownSearchItem[] }> => {
      if (!debouncedQuery.trim()) return { games: [], subscriptions: [], wallets: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute cache validity
  });

  // Flat list of all items for keyboard navigation index mapping
  const flatItems = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.games || []).map((item: DropdownSearchItem) => ({ ...item, categoryLabel: 'Игры' })),
      ...(data.wallets || []).map((item: DropdownSearchItem) => ({ ...item, categoryLabel: 'Пополнение' })),
      ...(data.subscriptions || []).map((item: DropdownSearchItem) => ({ ...item, categoryLabel: 'Подписки' }))
    ];
  }, [data]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when query or results change
  const [prevQuery, setPrevQuery] = useState(debouncedQuery);
  if (debouncedQuery !== prevQuery) {
    setPrevQuery(debouncedQuery);
    setActiveIndex(-1);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        e.preventDefault();
        router.push(flatItems[activeIndex].url);
        setIsOpen(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasResults = flatItems.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--text-secondary)]/50 pointer-events-none">
          {isLoading && query.trim().length > 0 ? (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Поиск по маркетплейсу..."
          className="w-full text-[14px] font-medium bg-[var(--bg-layer-2)] text-[var(--text-primary)] border border-[var(--border-muted)] rounded-xl outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--border-accent-glow)] placeholder-[var(--text-secondary)]/40 h-12 pl-12 pr-11"
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]/50 hover:text-[var(--text-primary)] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Floating Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[#121212]/95 border border-[#1F1F1F] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-md max-h-[460px] overflow-y-auto">
          {isLoading && flatItems.length === 0 ? (
            <div className="p-8 flex items-center justify-center gap-3 text-[var(--text-secondary)] text-[14px]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
              Ищем товары...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 text-[14px]">
              Ошибка загрузки результатов. Попробуйте еще раз.
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-[var(--text-secondary)] text-[14px]">
              Ничего не найдено по запросу &quot;{query}&quot;
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {/* Categorized rendering */}
              {['games', 'wallets', 'subscriptions'].map((categoryKey) => {
                const categoryLabel = 
                  categoryKey === 'games' ? '🎮 Игры' :
                  categoryKey === 'wallets' ? '💳 Пополнение' :
                  '⭐ Подписки';
                
                const categoryItems = 
                  categoryKey === 'games' ? data?.games || [] :
                  categoryKey === 'wallets' ? data?.wallets || [] :
                  data?.subscriptions || [];

                if (categoryItems.length === 0) return null;

                return (
                  <div key={categoryKey} className="space-y-1">
                    <h4 className="px-3 py-1.5 text-[11px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider select-none">
                      {categoryLabel}
                    </h4>
                    <div className="space-y-0.5">
                      {categoryItems.map((item: DropdownSearchItem) => {
                        // Find global flat index for active hover styling
                        const itemIndex = flatItems.findIndex((f) => f.id === item.id && f.productType === item.productType);
                        const isActive = itemIndex === activeIndex;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              router.push(item.url);
                              setIsOpen(false);
                            }}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            className={`flex items-center justify-between gap-4 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              isActive 
                                ? 'bg-white/5 border-l-2 border-[var(--accent)] pl-2.5' 
                                : 'hover:bg-white/5 border-l-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-layer-0)] border border-[#1F1F1F] shrink-0">
                                <Image
                                  src={item.image_url}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className="text-[13px] font-semibold text-white truncate max-w-[280px] sm:max-w-[360px]">
                                  {item.title}
                                </span>
                                <span className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
                                  {item.launcher || item.provider || item.categoryLabel}
                                </span>
                              </div>
                            </div>
                            
                            {/* Pricing & Discount */}
                            <div className="flex items-center gap-2.5 shrink-0 text-right">
                              {item.discountPercent > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/10 text-red-500">
                                  -{item.discountPercent}%
                                </span>
                              )}
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-white">
                                  {item.price.toLocaleString('ru-RU')} ₽
                                </span>
                                {item.discountPercent > 0 && (
                                  <span className="text-[10px] text-[var(--text-secondary)] line-through">
                                    {item.oldPrice.toLocaleString('ru-RU')} ₽
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Show All Results Footer Row */}
              <div 
                onClick={handleFormSubmit}
                className="mt-1 border-t border-[#1F1F1F] pt-2 px-3 pb-1 flex justify-between items-center text-[12px] font-semibold text-[var(--accent)] hover:text-white transition-colors cursor-pointer"
              >
                <span>Показать все результаты для &quot;{query}&quot;</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-normal">Enter ↵</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
