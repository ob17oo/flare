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
            height: 'h-90',
            cardBasis: 'basis-1/6'

        },
        medium: {
            height: 'aspect-square',
            cardBasis: 'basis-1/4'
        },
        large: {
            height: 'h-100',
            cardBasis: 'basis-1/3'
        }

}

export function CardComponent({item, sizeVariant }: CardProps) {
  const price = isProduct(item) ? item.price : undefined
  const description = 'description' in item ? item.description : null
  const launcherInfo = isGameProduct(item) && item.game?.launcher ? item.game.launcher : null
  return (
    <section>
      <div
        className={`relative ${SIZE_CONFIG[sizeVariant].height} overflow-hidden rounded-2xl`}
      >
        <Image
          className="object-cover"
          fill
          src={item.image_url}
          alt={item.title || "CarouselItem"}
        />
        {sizeVariant === "default" && launcherInfo && (
          <div className="absolute bottom-3 left-3 bg-[#6D6D6D]/60 rounded-2xl px-2 py-1">
            <div className="flex items-center gap-2">
              <Image
                src={launcherInfo.image_url || 'defaultImage'}
                width={24}
                height={24}
                alt={launcherInfo.title || "LauncherLogo"}
              />
              <p className="text-lg">{launcherInfo.title}</p>
            </div>
          </div>
        )}
      </div>
      <div>
        { sizeVariant === 'default' && price !== undefined ? (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-h4 text-green-400 font-semibold">
                {price} руб
              </span>
              <h3 className="text-h4 text-left">{item.title}</h3>
            </div>
        ) : sizeVariant === 'medium' ? (
            <div className="mt-1">
              <h3 className="text-h4 text-center">{item.title}</h3>
            </div>
        ) : (
            <div className="flex flex-col gap-1 mt-1">
              <h3 className="text-h4 text-left">{item.title}</h3>
              <p className="text-lg">{description}</p>
            </div>
        )
        }
      </div>
    </section>
  );
}
