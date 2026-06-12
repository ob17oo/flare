import { getAllOrders } from "@/entities/admin/api/orders.action";
import { OrdersClient } from "@/views/admin/orders/OrdersClient";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const initialData = await getAllOrders();

  return <OrdersClient initialData={initialData} />;
}
