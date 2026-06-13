import { TCarouselItem } from "@/entities/product/model/types";
import { isGameProduct, isProduct } from "@/shared/lib/type-guards";
import Image from "next/image";

type SizeVariant = 'default' | 'medium' | 'large'
type SizeConfig = {
  default: sizeConfigItem,
  medium: sizeConfigItem,
  large: sizeConfigItem
}

interface sizeConfigItem {
  height: string,
  cardBasis: string
}

interface CardProps {
  item: TCarouselItem
  sizeVariant: SizeVariant,
  sizeConfig?: SizeConfig
}

export const SIZE_CONFIG = {
    default: {
        height: 'h-44 sm:h-56 md:h-64 lg:h-72',
        cardBasis: 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
    },
    medium: {
        height: 'aspect-square',
        cardBasis: 'basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
    },
    large: {
        height: 'h-48 sm:h-64 md:h-72 lg:h-80',
        cardBasis: 'basis-full sm:basis-1/2 md:basis-1/3'
    }
}

export function CardComponent({item, sizeVariant }: CardProps) {
  const price = isProduct(item) ? item.price : undefined
  const description = 'description' in item ? item.description : null
  const launcherInfo = isGameProduct(item) && item.game?.launcher ? item.game.launcher : null
  
  // Safe cast for custom fields
  const customItem = item as any;
  const oldPrice = customItem.oldPrice || null;
  const discountPercent = customItem.discountPercent || 0;
  const categoryLabel = customItem.categoryLabel || null;

  return (
    <div className="group flex flex-col h-full bg-[var(--secondary)] border border-[var(--border-muted)] hover:border-[var(--accent)] rounded-2xl p-3.5 shadow-[var(--card-shadow)] transition-all duration-300">
      <div className={`relative ${SIZE_CONFIG[sizeVariant].height} overflow-hidden rounded-xl bg-[var(--bg-layer-0)]`}>
        <Image
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          fill
          src={item.image_url}
          alt={item.title || "CarouselItem"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Discount Badge on Image */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10">
            -{discountPercent}%
          </div>
        )}

        {sizeVariant === "default" && launcherInfo && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
            <Image
              src={launcherInfo.image_url || 'defaultImage'}
              width={24}
              height={24}
              alt={launcherInfo.title || "LauncherLogo"}
            />
            <p className="text-[11px] font-medium text-white">{launcherInfo.title}</p>
          </div>
        )}
      </div>
      
      <div className="mt-3.5 flex flex-col flex-1 justify-between gap-1.5">
        {sizeVariant === 'default' && price !== undefined ? (
          <div className="flex flex-col gap-1">
            {/* Category label */}
            {categoryLabel && (
              <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider mb-0.5">
                {categoryLabel}
              </span>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-bold text-[var(--text-primary)]">
                {price} руб
              </span>
              {oldPrice && oldPrice > price && (
                <span className="text-[12px] line-through text-[var(--text-secondary)]">
                  {oldPrice} руб
                </span>
              )}
            </div>
            
            <h4 className="text-[14px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-2 text-left leading-snug">
              {item.title}
            </h4>
          </div>
        ) : sizeVariant === 'medium' ? (
          <div className="flex items-center justify-center py-1">
            <h4 className="text-[14px] font-semibold text-[var(--text-primary)] text-center tracking-tight">
              {item.title}
            </h4>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <h4 className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors text-left">
              {item.title}
            </h4>
            {description && (
              <p className="text-[13px] text-[var(--text-secondary)] line-clamp-3 text-left leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
