/*
  Warnings:

  - You are about to drop the `edgeAttributes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "edgeAttributes" DROP CONSTRAINT "edgeAttributes_edgeOf_fkey";

-- DropIndex
DROP INDEX "Trace_id_key";

-- AlterTable
ALTER TABLE "Trace" ADD CONSTRAINT "Trace_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "edgeAttributes";

-- CreateTable
CREATE TABLE "EdgeAttributes" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "traceId" INTEGER NOT NULL,

    CONSTRAINT "EdgeAttributes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EdgeAttributes" ADD CONSTRAINT "EdgeAttributes_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
