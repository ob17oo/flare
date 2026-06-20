'use server';

import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";
import { PRODUCT_EDITION, PRODUCT_TYPE, Prisma } from "@prisma/client";

export interface ProductInput {
  title: string;
  description?: string | null | undefined;
  price: number | string;
  image_url?: string | null | undefined;
  isActive: boolean;
  productEdition?: PRODUCT_EDITION | string | undefined;
  stock: number | string;
  productType?: PRODUCT_TYPE | string | undefined;
  seoTitle?: string | null | undefined;
  seoDescription?: string | null | undefined;
  tags?: string[] | undefined;
  oldPrice?: number | string | null | undefined;
  discount?: number | string | null | undefined;
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
      description: data.description ?? null,
      price: Number(data.price),
      image_url: data.image_url || "/static/default/default-product.png",
      isActive: data.isActive,
      productEdition: (data.productEdition as PRODUCT_EDITION) || 'Standard',
      stock: Number(data.stock),
      productType: (data.productType as PRODUCT_TYPE) || 'GAME',
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
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

  const updateData: Prisma.ProductUpdateInput = {
    title: data.title,
    description: data.description ?? null,
    price: Number(data.price),
    isActive: data.isActive,
    stock: Number(data.stock),
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    tags: tags
  };

  if (data.image_url) {
    updateData.image_url = data.image_url;
  }
  if (data.productEdition) {
    updateData.productEdition = data.productEdition as PRODUCT_EDITION;
  }
  if (data.productType) {
    updateData.productType = data.productType as PRODUCT_TYPE;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData
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
