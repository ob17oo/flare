'use client'

import { ABOUT_DATA } from "@/shared/constants/about.constants"
import { ShieldCheck, Award, Zap, Heart, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export function AboutPage() {
  const advantageIcons = [Zap, ShieldCheck, Award, Heart]

  return (
    <div className="max-w-[840px] mx-auto py-10 flex flex-col gap-12 animate-fade-in">
      {/* Hero Section */}
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-[36px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
          О проекте <span className="text-[var(--accent)]">Flare</span>
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] max-w-[560px] mx-auto leading-relaxed">
          Премиальный маркетплейс цифровых товаров и услуг. Мы убираем любые барьеры между геймерами и их любимыми развлечениями.
        </p>
      </div>

      {/* Grid: Who We Are & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] border-b border-[var(--border-muted)] pb-2">
            {ABOUT_DATA.whoWeAre.title}
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {ABOUT_DATA.whoWeAre.text}
          </p>
        </div>

        <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-3">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] border-b border-[var(--border-muted)] pb-2">
            {ABOUT_DATA.mission.title}
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {ABOUT_DATA.mission.text}
          </p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-2xl shadow-[var(--card-shadow)]">
        {ABOUT_DATA.stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-1 text-center border-r last:border-0 border-[var(--border-muted)]/60">
            <span className="text-[22px] font-black text-[var(--text-primary)] leading-none">
              {stat.value}
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Advantages Grid */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] text-center sm:text-left">
          Наши преимущества
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ABOUT_DATA.advantages.map((adv, idx) => {
            const IconComp = advantageIcons[idx] || CheckCircle2
            return (
              <div key={idx} className="bg-[var(--secondary)] border border-[var(--border-muted)] p-5 rounded-xl flex gap-4 items-start hover:border-[var(--accent)]/50 transition-all duration-300">
                <span className="p-2.5 rounded-lg bg-[var(--bg-layer-2)] border border-[var(--border-muted)] shrink-0 text-[var(--accent)]">
                  <IconComp size={18} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[14px] font-bold text-[var(--text-primary)] leading-none">
                    {adv.title}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-normal">
                    {adv.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Block */}
      <div className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-6 shadow-[var(--card-shadow)] flex flex-col gap-3">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-muted)] pb-3">
          <span className="text-[var(--success)]">
            <ShieldCheck size={20} />
          </span>
          <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
            {ABOUT_DATA.security.title}
          </h2>
        </div>
        <p className="text-[13px] md:text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {ABOUT_DATA.security.text}
        </p>
      </div>

      {/* Supported Launchers / Platforms */}
      <div className="flex flex-col gap-4 text-center sm:text-left">
        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
          Поддерживаемые платформы
        </span>
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {ABOUT_DATA.platforms.map((platform, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-[var(--secondary)] border border-[var(--border-muted)] rounded-xl text-[12px] font-semibold text-[var(--text-primary)]">
              <div className="relative w-4 h-4">
                <Image className="object-contain" fill src={platform.imageUrl} alt={platform.name} />
              </div>
              {platform.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
