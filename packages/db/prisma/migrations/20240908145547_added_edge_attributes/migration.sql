/*
  Warnings:

  - You are about to drop the column `cexAddresses` on the `Trace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trace" DROP COLUMN "cexAddresses";

-- CreateTable
CREATE TABLE "edgeAttributes" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "edgeOf" SERIAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "edgeAttributes_id_key" ON "edgeAttributes"("id");

-- AddForeignKey
ALTER TABLE "edgeAttributes" ADD CONSTRAINT "edgeAttributes_edgeOf_fkey" FOREIGN KEY ("edgeOf") REFERENCES "Trace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
