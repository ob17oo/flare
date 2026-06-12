import { ContactsPage } from "@/views"

export const metadata = {
  title: "Контакты | Flare",
  description: "Свяжитесь с поддержкой платформы Flare. Наш email, Telegram, Discord сервер и форма обратной связи.",
  openGraph: {
    title: "Контакты | Flare",
    description: "Свяжитесь с поддержкой платформы Flare. Наш email, Telegram, Discord сервер и форма обратной связи.",
    type: "website"
  }
}

export default function Contacts() {
  return <ContactsPage />
}
