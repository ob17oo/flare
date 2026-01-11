-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Essentials';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Extra';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Premium';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Core';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Ultimate';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Arcade';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'Nitro';
ALTER TYPE "PRODUCT_EDITION" ADD VALUE 'DLC';
