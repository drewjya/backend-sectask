/*
  Warnings:

  - You are about to drop the column `wrapperId` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `DocumentWrapper` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `DocumentWrapper` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_wrapperId_fkey";

-- DropIndex
DROP INDEX "Document_wrapperId_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "wrapperId";

-- AlterTable
ALTER TABLE "DocumentWrapper" ADD COLUMN     "documentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentWrapper_documentId_key" ON "DocumentWrapper"("documentId");

-- AddForeignKey
ALTER TABLE "DocumentWrapper" ADD CONSTRAINT "DocumentWrapper_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
