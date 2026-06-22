import { getAllProducts } from "@/entities/admin/api/products.action";
import { getAllLaunchers } from "@/entities/game/api/getLaunchers.api";
import { ProductsClient } from "@/views/admin/products/ProductsClient";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const initialData = await getAllProducts();
  const launchers = await getAllLaunchers();

  return <ProductsClient initialData={initialData} launchers={launchers} />;
}
