'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }
  });
  return products;
}

export async function createProduct(data: any) {
  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      image_url: data.image_url || "/static/default/default-product.png",
      isActive: data.isActive,
      productEdition: data.productEdition || 'Standard',
      stock: Number(data.stock),
      productType: data.productType || 'GAME',
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      tags: data.tags || []
    }
  });
  revalidatePath('/admin/products');
  return product;
}

export async function updateProduct(id: number, data: any) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      image_url: data.image_url,
      isActive: data.isActive,
      productEdition: data.productEdition,
      stock: Number(data.stock),
      productType: data.productType,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      tags: data.tags
    }
  });
  revalidatePath('/admin/products');
  return product;
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id }
  });
  revalidatePath('/admin/products');
  return { success: true };
}
