import { AboutPage } from "@/views"

export const metadata = {
  title: "О нас | Flare",
  description: "Узнайте о миссии платформы Flare, наших преимуществах, поддерживаемых игровых платформах и стандартах безопасности.",
  openGraph: {
    title: "О нас | Flare",
    description: "Узнайте о миссии платформы Flare, наших преимуществах, поддерживаемых игровых платформах и стандартах безопасности.",
    type: "website"
  }
}

export default function About() {
  return <AboutPage />
}
