import { getAllBanners } from "@/entities/admin/api/marketing.action";
import { MarketingClient } from "@/views/admin/marketing/MarketingClient";

export const dynamic = 'force-dynamic';

export default async function AdminMarketingPage() {
  const initialData = await getAllBanners();

  return <MarketingClient initialData={initialData} />;
}
