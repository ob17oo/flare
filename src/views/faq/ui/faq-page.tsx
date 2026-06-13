'use client'

import { useState, useMemo } from "react"
import { FAQ_DATA, FAQCategory, FAQItem } from "@/shared/constants/faq.constants"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, InputComponent } from "@/shared/components"
import { 
  ShoppingBag, 
  CreditCard, 
  Wallet, 
  RefreshCw, 
  Award, 
  Gamepad2, 
  User, 
  ShieldAlert, 
  Wrench, 
  Search, 
  HelpCircle 
} from "lucide-react"

const IconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag,
  CreditCard,
  Wallet,
  RefreshCw,
  Award,
  Gamepad2,
  User,
  ShieldAlert,
  Wrench
}

export function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(FAQ_DATA[0].id)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    const results: { categoryTitle: string; item: FAQItem }[] = []
    
    FAQ_DATA.forEach(cat => {
      cat.items.forEach(item => {
        if (
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query)
        ) {
          results.push({ categoryTitle: cat.title, item })
        }
      })
    })
    return results
  }, [searchQuery])

  const selectedCategory = useMemo(() => {
    return FAQ_DATA.find(cat => cat.id === selectedCategoryId) || FAQ_DATA[0]
  }, [selectedCategoryId])

  const renderIcon = (iconName: string, className?: string) => {
    const IconComp = IconMap[iconName]
    return IconComp ? <IconComp size={16} className={className} /> : <HelpCircle size={16} className={className} />
  }

  return (
    <div className="max-w-[1000px] mx-auto py-10 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-2 text-center max-w-[600px] mx-auto">
        <h1 className="text-[32px] font-bold tracking-tight text-[var(--text-primary)]">
          Часто задаваемые вопросы
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Найдите ответы на популярные вопросы о покупках, платежах и технической поддержке Flare
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl mx-auto w-full">
        <div className="relative">
          <InputComponent
            type="text"
            sizeVariant="medium"
            placeholder="Поиск по вопросам..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-11 pr-4"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        </div>
      </div>

      {/* Content layout */}
      {searchQuery.trim() ? (
        // Search Results View
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-4">
            <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
              Результаты поиска по запросу &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-[12px] text-[var(--text-secondary)] font-medium">
              Найдено совпадений: {searchResults.length}
            </span>
          </div>

          {searchResults.length > 0 ? (
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {searchResults.map(({ categoryTitle, item }, idx) => (
                <AccordionItem key={item.id} value={item.id} className="border border-[var(--border-muted)]/60 bg-[var(--bg-layer-2)]/30">
                  <AccordionTrigger className="hover:text-[var(--accent)] font-semibold text-[14px] py-4">
                    <span className="flex items-center gap-2.5">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] bg-[var(--bg-layer-3)] px-2 py-0.5 rounded-md border border-[var(--border-muted)]">
                        {categoryTitle}
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="py-12 text-center flex flex-col gap-1.5 items-center">
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">Ничего не найдено</span>
              <span className="text-[12px] text-[var(--text-secondary)]">Попробуйте ввести другой поисковый запрос</span>
            </div>
          )}
        </div>
      ) : (
        // Standard Tabbed View
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 mt-2">
          {/* Categories list */}
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-hide gap-1.5 pb-2 md:pb-0">
            <span className="hidden md:inline-block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-3 mb-1">
              Категории вопросов
            </span>
            {FAQ_DATA.map(cat => {
              const isActive = cat.id === selectedCategoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium transition-all duration-200 cursor-pointer shrink-0 md:w-full ${
                    isActive
                      ? 'bg-[var(--accent)] text-white border-transparent shadow-sm'
                      : 'bg-[var(--secondary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]/30'
                  }`}
                >
                  {renderIcon(cat.icon, isActive ? 'text-white' : 'text-[var(--text-secondary)]')}
                  <span className="truncate">{cat.title}</span>
                </button>
              )
            })}
          </div>

          {/* Q&A Accordion */}
          <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-6 h-fit">
            <div className="flex items-center gap-3 border-b border-[var(--border-muted)] pb-4">
              <span className="p-2 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)]">
                {renderIcon(selectedCategory.icon, 'text-[var(--accent)]')}
              </span>
              <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
                {selectedCategory.title}
              </h2>
            </div>

            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {selectedCategory.items.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border border-[var(--border-muted)]/60 bg-[var(--bg-layer-2)]/20">
                  <AccordionTrigger className="hover:text-[var(--accent)] font-semibold text-[14px] py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-2">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  )
}
