import { authOptions } from "@/shared/lib/auth";
import { Footer, Header } from "@/widgets";
import { getServerSession } from "next-auth";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverSession = await getServerSession(authOptions)
  return (
    <>
    <Header serverSession={serverSession} />
    {children}
    <Footer />
    </>
  );
}