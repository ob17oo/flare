-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "servicePlanId" INTEGER;

-- CreateIndex
CREATE INDEX "Order_servicePlanId_idx" ON "Order"("servicePlanId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
