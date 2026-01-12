import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/shared/providers";
import { QueryProvider } from "@/shared/providers/Query-Provider/Query-Provider";

const Exo = Exo_2({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500' , '600' , '700' , '800' , '900']
})

export const metadata: Metadata = {
  title: "Flare",
  description: "Сервис по продаже цифровых товаров и услуг",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Exo.className} antialiased`}
      > 
        <QueryProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
