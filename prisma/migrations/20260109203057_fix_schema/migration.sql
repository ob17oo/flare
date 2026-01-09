/*
  Warnings:

  - The values [Standart] on the enum `PRODUCT_EDITION` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `stock` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PRODUCT_EDITION_new" AS ENUM ('Lite', 'Standard', 'Deluxe');
ALTER TABLE "public"."Product" ALTER COLUMN "productEdition" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "productEdition" TYPE "PRODUCT_EDITION_new" USING ("productEdition"::text::"PRODUCT_EDITION_new");
ALTER TYPE "PRODUCT_EDITION" RENAME TO "PRODUCT_EDITION_old";
ALTER TYPE "PRODUCT_EDITION_new" RENAME TO "PRODUCT_EDITION";
DROP TYPE "public"."PRODUCT_EDITION_old";
ALTER TABLE "Product" ALTER COLUMN "productEdition" SET DEFAULT 'Standard';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "productEdition" SET DEFAULT 'Standard',
ALTER COLUMN "stock" SET NOT NULL;
