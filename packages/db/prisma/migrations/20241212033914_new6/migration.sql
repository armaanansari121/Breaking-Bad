/*
  Warnings:

  - You are about to drop the column `freq` on the `FreqeAttributes` table. All the data in the column will be lost.
  - Added the required column `frequency` to the `FreqeAttributes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FreqeAttributes" DROP COLUMN "freq",
ADD COLUMN     "frequency" INTEGER NOT NULL;
