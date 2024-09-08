/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Trace` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Trace_txHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "Trace_id_key" ON "Trace"("id");
