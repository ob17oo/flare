import { authOptions } from "@/shared/lib/auth";
import { Header } from "@/widgets/Header";
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
    </>
  );
}