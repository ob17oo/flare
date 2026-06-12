import { getAllAuditLogs } from "@/entities/admin/api/audit.action";
import { AuditClient } from "@/views/admin/audit/AuditClient";

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const initialData = await getAllAuditLogs();

  return <AuditClient initialData={initialData} />;
}
