/*
  Warnings:

  - You are about to drop the column `genre` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `launcher` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `launcher_url` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `salesCount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ServicePlans` table. All the data in the column will be lost.
  - You are about to drop the column `serviceEdition` on the `ServicePlans` table. All the data in the column will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId]` on the table `ServicePlans` will be added. If there are existing duplicate values, this will fail.
  - Made the column `isActive` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productEdition` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `productId` to the `ServicePlans` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PRODUCT_TYPE" AS ENUM ('GAME', 'WALLET', 'SERVICE_PLANS', 'BANNER');

-- DropForeignKey
ALTER TABLE "ServicePlans" DROP CONSTRAINT "ServicePlans_serviceId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "genre",
DROP COLUMN "launcher",
DROP COLUMN "launcher_url",
DROP COLUMN "salesCount",
ADD COLUMN     "productType" "PRODUCT_TYPE" NOT NULL DEFAULT 'GAME',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "image_url" SET DEFAULT '/images/default-non-image.png',
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "productEdition" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL;

-- AlterTable
ALTER TABLE "ServicePlans" DROP COLUMN "price",
DROP COLUMN "serviceEdition",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "Launcher" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL DEFAULT '/images/default-launcher.png',

    CONSTRAINT "Launcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "launcherId" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlatform" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL DEFAULT 'images/default-servicePlatform.png',
    "category" TEXT NOT NULL DEFAULT 'Gaming',

    CONSTRAINT "ServicePlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_productId_key" ON "Game"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePlatform_title_key" ON "ServicePlatform"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePlans_productId_key" ON "ServicePlans"("productId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_launcherId_fkey" FOREIGN KEY ("launcherId") REFERENCES "Launcher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePlans" ADD CONSTRAINT "ServicePlans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePlans" ADD CONSTRAINT "ServicePlans_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServicePlatform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
