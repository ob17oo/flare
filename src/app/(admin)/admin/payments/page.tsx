import { getAllPayments } from "@/entities/admin/api/payments.action";
import { PaymentsClient } from "@/views/admin/payments/PaymentsClient";

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const initialData = await getAllPayments();

  return <PaymentsClient initialData={initialData} />;
}
