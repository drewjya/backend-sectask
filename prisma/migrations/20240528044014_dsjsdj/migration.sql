/*
  Warnings:

  - You are about to drop the column `documentId` on the `Finding` table. All the data in the column will be lost.
  - Added the required column `descriptionId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threatAndRiskId` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_documentId_fkey";

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "documentId",
ADD COLUMN     "descriptionId" TEXT NOT NULL,
ADD COLUMN     "threatAndRiskId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
