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

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}
