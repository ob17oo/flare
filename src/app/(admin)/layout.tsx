import { ReactNode } from "react";
import { Metadata } from "next";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Flare Admin Panel",
  description: "Administrative panel for the Flare project",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
