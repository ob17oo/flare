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

export function getAppUrl() {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://flareee.vercel.app';
  }
  return envUrl || 'http://localhost:3000';
}
