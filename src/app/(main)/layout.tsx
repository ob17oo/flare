import { Header } from "@/widgets/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header />
    {children}
    </>
  );
}
