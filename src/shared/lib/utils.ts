import { cn } from "./tailwind-cn";

export { cn };

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}
