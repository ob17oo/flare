import { authOptions } from "@/shared/lib/auth";
import { Footer, Header } from "@/widgets";
import { getServerSession } from "next-auth";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  return (
    <>
    <Header session={session} />
    {children}
    <Footer />
    </>
  );
}