/*
  Warnings:

  - You are about to drop the `BalanceInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `EndReceiver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `EndReceiver` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BalanceInfo" DROP CONSTRAINT "BalanceInfo_id_fkey";

-- AlterTable
ALTER TABLE "EndReceiver" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "balance" INTEGER NOT NULL;

-- DropTable
DROP TABLE "BalanceInfo";
