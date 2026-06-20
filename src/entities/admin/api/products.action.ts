'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { PRODUCT_EDITION, PRODUCT_TYPE } from "@prisma/client";

export interface ProductInput {
  title: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  isActive: boolean;
  productEdition?: PRODUCT_EDITION | string;
  stock: number | string;
  productType?: PRODUCT_TYPE | string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
  oldPrice?: number | string | null;
  discount?: number | string | null;
}

export async function parseProductTags<T extends { id: number; price: number; tags: string[] }>(product: T) {
  if (!product) return product;
  const tags = product.tags || [];
  let oldPrice: number | null = null;
  let discount: number | null = null;
  
  for (const tag of tags) {
    if (tag.startsWith('oldPrice:')) {
      oldPrice = Number(tag.split(':')[1]);
    } else if (tag.startsWith('discount:')) {
      discount = Number(tag.split(':')[1]);
    }
  }
  
  // Fallback to mock discount if it matches the mock rule (id % 3 === 0)
  // ONLY if not explicitly set to something else (e.g. if both are null)
  const isMock = product.id % 3 === 0;
  if (discount === null && oldPrice === null && isMock) {
    discount = 10 + (product.id % 4) * 5;
    oldPrice = Math.round(product.price / (1 - discount / 100));
  }
  
  return {
    ...product,
    oldPrice: oldPrice || undefined,
    discount: discount || undefined,
    discountPercent: discount || 0
  };
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }
  });
  return Promise.all(products.map(p => parseProductTags(p)));
}

export async function createProduct(data: ProductInput) {
  let tags = data.tags || [];
  tags = tags.filter((t: string) => !t.startsWith('oldPrice:') && !t.startsWith('discount:'));
  if (data.oldPrice && Number(data.oldPrice) > 0) {
    tags.push(`oldPrice:${Number(data.oldPrice)}`);
  }
  if (data.discount && Number(data.discount) > 0) {
    tags.push(`discount:${Number(data.discount)}`);
  }

  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      image_url: data.image_url || "/static/default/default-product.png",
      isActive: data.isActive,
      productEdition: (data.productEdition as PRODUCT_EDITION) || 'Standard',
      stock: Number(data.stock),
      productType: (data.productType as PRODUCT_TYPE) || 'GAME',
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      tags: tags
    }
  });
  revalidatePath('/admin/products');
  return await parseProductTags(product);
}

export async function updateProduct(id: number, data: ProductInput) {
  let tags = data.tags || [];
  tags = tags.filter((t: string) => !t.startsWith('oldPrice:') && !t.startsWith('discount:'));
  if (data.oldPrice && Number(data.oldPrice) > 0) {
    tags.push(`oldPrice:${Number(data.oldPrice)}`);
  }
  if (data.discount && Number(data.discount) > 0) {
    tags.push(`discount:${Number(data.discount)}`);
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      image_url: data.image_url || undefined,
      isActive: data.isActive,
      productEdition: data.productEdition ? (data.productEdition as PRODUCT_EDITION) : undefined,
      stock: Number(data.stock),
      productType: data.productType ? (data.productType as PRODUCT_TYPE) : undefined,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      tags: tags
    }
  });
  revalidatePath('/admin/products');
  return await parseProductTags(product);
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id }
  });
  revalidatePath('/admin/products');
  return { success: true };
}
