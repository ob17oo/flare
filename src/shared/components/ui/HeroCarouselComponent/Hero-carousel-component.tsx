"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/shadCN/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeroCarouselComponentProps {
  carouselItem?: any; // kept for backward-compatibility but ignored in favor of DB banners
}

const fallbackBanner = {
  id: 0,
  title: "Добро пожаловать во Flare!",
  subtitle: "Лучшие цифровые товары и пополнения",
  description: "Мгновенная доставка, выгодный кэшбэк и круглосуточная поддержка ваших любимых игр, сервисов и кошельков.",
  image_url: "/static/default/default-product.png",
  buttonText: "Перейти в каталог",
  linkUrl: "/games",
  promoCode: null
};

export function HeroCarouselComponent({}: HeroCarouselComponentProps) {
  const router = useRouter();

  // Fetch active banners dynamically via React Query
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['active-marketing-banners'],
    queryFn: async () => {
      const res = await fetch('/api/marketing/banners');
      if (!res.ok) throw new Error('Failed to fetch banners');
      return res.json() as Promise<any[]>;
    },
    staleTime: 60 * 1000
  });

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const displayItems = banners.length > 0 ? banners : [fallbackBanner];

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, displayItems.length]);

  // Track impressions when banners are fetched successfully
  const bannerIdsString = banners.map((b: any) => b.id).join(',');
  useEffect(() => {
    if (banners && banners.length > 0) {
      const bannerIds = banners.map((b: any) => b.id).filter(id => id > 0);
      if (bannerIds.length > 0) {
        fetch('/api/marketing/banners/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'impression', bannerIds })
        }).catch(err => console.error('Impression tracking failed:', err));
      }
    }
  }, [bannerIdsString]);

  const handleBannerClick = (banner: any) => {
    if (banner.id > 0) {
      // Fire click tracking
      fetch('/api/marketing/banners/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click', bannerId: banner.id })
      }).catch(err => console.error('Click tracking failed:', err));
    }

    // Redirect mapping
    let destination = banner.linkUrl || '/';
    if (banner.promoCode) {
      const connector = destination.includes('?') ? '&' : '?';
      destination = `${destination}${connector}promo=${banner.promoCode.toUpperCase()}`;
    }

    router.push(destination);
  };

  if (isLoading) {
    return (
      <div className="h-[320px] sm:h-[400px] md:h-[480px] lg:h-[640px] w-full rounded-3xl bg-[var(--secondary)] border border-[var(--border-muted)] animate-pulse flex items-center justify-center">
        <div className="text-[var(--text-secondary)] font-semibold">Загрузка предложений...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {displayItems.map((item) => (
              <CarouselItem
                key={item.id}
                className="h-[320px] sm:h-[400px] md:h-[480px] lg:h-[640px] basis-full"
              >
                <div className="h-full w-full rounded-3xl relative overflow-hidden bg-[var(--secondary)] border border-[var(--border-muted)]">
                  <Image
                    className="opacity-30 object-cover object-center"
                    src={item.image_url}
                    fill
                    alt={item.title}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E10] via-[#0E0E10]/80 to-transparent z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10]/95 via-transparent to-transparent z-0" />

                  <div className="absolute inset-y-0 left-6 right-6 sm:left-12 sm:right-12 md:left-24 md:right-24 flex flex-col justify-center max-w-xl z-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        {item.subtitle && (
                          <span className="text-[11px] sm:text-[13px] font-extrabold text-[var(--accent)] uppercase tracking-wider text-left">
                            {item.subtitle}
                          </span>
                        )}
                        <h1 className="font-extrabold text-[24px] sm:text-[36px] md:text-[48px] uppercase tracking-tight text-[var(--text-primary)] leading-tight text-left">
                          {item.title.toUpperCase()}
                        </h1>
                        {item.description && (
                          <p className="text-[13px] sm:text-[15px] text-[var(--text-secondary)] text-left leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold rounded-xl cursor-pointer w-fit shadow-[var(--card-shadow)] active:scale-95 transition-all duration-300"
                        onClick={() => handleBannerClick(item)}
                      >
                        {item.buttonText || "Подробнее"}
                      </button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-between gap-2 z-10 w-[90%] max-w-xs">
            {Array.from({ length: count }).map((_, index) => (
              <button
                onClick={() => api?.scrollTo(index)}
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  index === current
                    ? "bg-[var(--accent)] scale-x-110"
                    : "bg-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/40"
                } `}
                aria-label={`Слайд ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
