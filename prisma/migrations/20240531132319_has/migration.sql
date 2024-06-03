/*
  Warnings:

  - You are about to drop the column `descriptionId` on the `findings` table. All the data in the column will be lost.
  - You are about to drop the column `threatAndRiskId` on the `findings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_threatAndRiskId_fkey";

-- DropIndex
DROP INDEX "findings_descriptionId_key";

-- DropIndex
DROP INDEX "findings_threatAndRiskId_key";

-- AlterTable
ALTER TABLE "findings" DROP COLUMN "descriptionId",
DROP COLUMN "threatAndRiskId";

-- CreateTable
CREATE TABLE "DocumentWrapper" (
    "findingId" INTEGER NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "DocumentWrapper_pkey" PRIMARY KEY ("documentId","findingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentWrapper_documentId_key" ON "DocumentWrapper"("documentId");

-- AddForeignKey
ALTER TABLE "DocumentWrapper" ADD CONSTRAINT "DocumentWrapper_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentWrapper" ADD CONSTRAINT "DocumentWrapper_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
