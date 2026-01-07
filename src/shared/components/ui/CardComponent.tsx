import { ProductsTypes } from "@/shared/types/product.types";
import Image from "next/image";

type SizeVariant = 'default' | 'medium' | 'large'


interface CardProps {
    item: ProductsTypes
    sizeVariant: SizeVariant
}
    const sizeConfig = {
        default: {
            height: 'h-76',
            cardBasis: 'basis-1/7'

        },
        medium: {
            height: 'h-76',
            cardBasis: 'basis-1/4'
        },
        large: {
            height: 'h-96',
            cardBasis: 'basis-1/3'
        }

    }


export function CardComponent({item, sizeVariant, }: CardProps) {
  return (
    <section>
      <div
        className={`relative ${sizeConfig[sizeVariant].height} overflow-hidden rounded-2xl`}
      >
        <Image
          className="object-cover"
          fill
          src={item.image_url}
          alt={item.title || "CarouselItem"}
        />
        {sizeVariant === "default" && (
          <div className="absolute bottom-3 left-3 bg-[#6D6D6D]/60 rounded-2xl px-2 py-1">
            <div className="flex items-center gap-2">
              <Image
                src={item.launcher_url}
                width={24}
                height={24}
                alt={item.launcher || "LauncherLogo"}
              />
              <p className="text-lg">{item.launcher}</p>
            </div>
          </div>
        )}
      </div>
      {sizeVariant === "default" && (
        <span className="text-lg text-green-400 font-semibold">
          {item.price} руб
        </span>
      )}
      <p
        className={`text-lg ${
          sizeVariant !== "medium" ? "text-left" : "text-center"
        }`}
      >
        {item.title}
      </p>
      {sizeVariant === "large" && <p className="">{item.description}</p>}
    </section>
  );
}
