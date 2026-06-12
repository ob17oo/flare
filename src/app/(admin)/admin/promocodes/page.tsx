import { getAllPromocodes } from "@/entities/admin/api/promocodes.action";
import { PromocodesClient } from "@/views/admin/promocodes/PromocodesClient";

export const dynamic = 'force-dynamic';

export default async function AdminPromocodesPage() {
  const initialData = await getAllPromocodes();

  return <PromocodesClient initialData={initialData} />;
}
