/*
  Warnings:

  - You are about to drop the column `businessImpactId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `recommendationId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `retestResultId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `threatAndRiskId` on the `Finding` table. All the data in the column will be lost.
  - Added the required column `documentId` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_businessImpactId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_recommendationId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_retestResultId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_threatAndRiskId_fkey";

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "businessImpactId",
DROP COLUMN "descriptionId",
DROP COLUMN "recommendationId",
DROP COLUMN "retestResultId",
DROP COLUMN "threatAndRiskId",
ADD COLUMN     "documentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
