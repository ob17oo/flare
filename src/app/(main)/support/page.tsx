import { SupportPage } from "@/views"

export const metadata = {
  title: "Техническая поддержка | Flare",
  description: "Создавайте обращения в службу поддержки Flare по поводу оплаты, заказов или работы сайта и отслеживайте их статус в личном кабинете.",
  openGraph: {
    title: "Техническая поддержка | Flare",
    description: "Создавайте обращения в службу поддержки Flare по поводу оплаты, заказов или работы сайта и отслеживайте их статус в личном кабинете.",
    type: "website"
  }
}

export default function Support() {
  return <SupportPage />
}
