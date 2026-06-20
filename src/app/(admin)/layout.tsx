import { ReactNode } from "react";
import { Metadata } from "next";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Flare Admin Panel",
  description: "Administrative panel for the Flare project",
  icons: {
    icon: "/static/Flare-logotype.svg",
    shortcut: "/static/Flare-logotype.svg",
    apple: "/static/Flare-logotype.svg",
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
