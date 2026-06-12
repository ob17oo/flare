import { getAllTickets } from "@/entities/admin/api/support.action";
import { SupportClient } from "@/views/admin/support/SupportClient";

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const initialData = await getAllTickets();

  return <SupportClient initialData={initialData} />;
}
