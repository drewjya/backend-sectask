/*
  Warnings:

  - You are about to drop the column `documentId` on the `DocumentWrapper` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wrapperId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wrapperId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DocumentWrapper" DROP CONSTRAINT "DocumentWrapper_documentId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "wrapperId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DocumentWrapper" DROP COLUMN "documentId";

-- CreateIndex
CREATE UNIQUE INDEX "Document_wrapperId_key" ON "Document"("wrapperId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_wrapperId_fkey" FOREIGN KEY ("wrapperId") REFERENCES "DocumentWrapper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
