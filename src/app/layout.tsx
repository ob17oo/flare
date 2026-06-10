import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SessionProvider, ThemeProvider } from "@/shared/providers";
import { QueryProvider } from "@/shared/providers/Query-Provider/Query-Provider";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800']
});

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
    <html lang="ru" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased"> 
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
