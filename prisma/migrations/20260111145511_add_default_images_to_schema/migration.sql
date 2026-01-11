/*
  Warnings:

  - Made the column `image_url` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Launcher" ALTER COLUMN "title" SET DEFAULT 'Flare',
ALTER COLUMN "image_url" SET DEFAULT '/static/default/default-launcher.svg';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "image_url" SET DEFAULT '/static/default/default-product.png';

-- AlterTable
ALTER TABLE "ServicePlans" ALTER COLUMN "subImage_url" SET DEFAULT '/static/default/default-subService.png';

-- AlterTable
ALTER TABLE "ServicePlatform" ALTER COLUMN "image_url" SET DEFAULT '/static/default/default-service.svg';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image_url" SET NOT NULL,
ALTER COLUMN "image_url" SET DEFAULT '/static/default/default-user.svg';

-- CreateIndex
CREATE INDEX "Product_productType_isActive_idx" ON "Product"("productType", "isActive");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_rating_idx" ON "Product"("rating");
