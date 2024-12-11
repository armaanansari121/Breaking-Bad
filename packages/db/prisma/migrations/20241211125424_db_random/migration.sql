/*
  Warnings:

  - You are about to drop the column `result` on the `Trace` table. All the data in the column will be lost.
  - Added the required column `freqGraph` to the `Trace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `graph` to the `Trace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trace" DROP COLUMN "result",
ADD COLUMN     "freqGraph" JSONB NOT NULL,
ADD COLUMN     "graph" JSONB NOT NULL;
