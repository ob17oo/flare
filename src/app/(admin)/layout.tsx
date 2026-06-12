import { ReactNode } from "react";
import { AdminSidebar } from "@/widgets/AdminSidebar";
import { AdminHeader } from "@/widgets/AdminHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flare Admin Panel",
  description: "Administrative panel for the Flare project",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
