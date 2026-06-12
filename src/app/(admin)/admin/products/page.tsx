import { getAllProducts } from "@/entities/admin/api/products.action";
import { ProductsClient } from "@/views/admin/products/ProductsClient";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const initialData = await getAllProducts();

  return <ProductsClient initialData={initialData} />;
}
