/*
  Warnings:

  - You are about to drop the column `balanceId` on the `BalanceInfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BalanceInfo" DROP CONSTRAINT "BalanceInfo_balanceId_fkey";

-- AlterTable
ALTER TABLE "BalanceInfo" DROP COLUMN "balanceId";

-- CreateTable
CREATE TABLE "FreqeAttributes" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "freqedgeattributes" INTEGER NOT NULL,
    "traceId" INTEGER NOT NULL,

    CONSTRAINT "FreqeAttributes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BalanceInfo" ADD CONSTRAINT "BalanceInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "EndReceiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreqeAttributes" ADD CONSTRAINT "FreqeAttributes_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
