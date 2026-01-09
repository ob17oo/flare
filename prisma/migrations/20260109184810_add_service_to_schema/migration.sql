/*
  Warnings:

  - You are about to drop the column `gameEdition` on the `Product` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "USER_ROLE" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('PENDING', 'CANCELLED', 'SUCCESS', 'PROCESSING');

-- CreateEnum
CREATE TYPE "PRODUCT_EDITION" AS ENUM ('Lite', 'Standart', 'Deluxe');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "gameEdition",
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "productEdition" "PRODUCT_EDITION" DEFAULT 'Standart',
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "salesCount" INTEGER DEFAULT 0,
ADD COLUMN     "stock" INTEGER DEFAULT 0,
ALTER COLUMN "description" SET DEFAULT 'Описание товара';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "USER_ROLE" DEFAULT 'USER';

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT 'Описание товара',
    "image_url" TEXT NOT NULL DEFAULT '/images/default-service.png',
    "serviceCategory" TEXT NOT NULL DEFAULT 'Развлечение',

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePlans" (
    "id" SERIAL NOT NULL,
    "subTitle" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "subImage_url" TEXT NOT NULL DEFAULT '/images/default-subImage.png',
    "serviceEdition" "PRODUCT_EDITION" NOT NULL DEFAULT 'Standart',
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "ServicePlans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServicePlans" ADD CONSTRAINT "ServicePlans_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
