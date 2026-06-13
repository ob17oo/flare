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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex-1 w-[90%] max-w-[1440px] mx-auto flex flex-col">
        <Header serverSession={serverSession} />
        <main className="w-full flex-grow flex-1">
          {children}
        </main>
      </div>
      <div className="w-[90%] max-w-[1440px] mx-auto">
        <Footer />
      </div>
    </div>
  );
}