/*
  Warnings:

  - You are about to drop the column `description` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Finding` table. All the data in the column will be lost.
  - Added the required column `name` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectRole" ADD VALUE 'DEVELOPER';
ALTER TYPE "ProjectRole" ADD VALUE 'TECHNICAL_WRITER';

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "risk" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "previousBlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FindingsDescription" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsThreat" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsImpact" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsRecomendation" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsRetestResult" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_previousBlockId_key" ON "Block"("previousBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsDescription_AB_unique" ON "_FindingsDescription"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsDescription_B_index" ON "_FindingsDescription"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsThreat_AB_unique" ON "_FindingsThreat"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsThreat_B_index" ON "_FindingsThreat"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsImpact_AB_unique" ON "_FindingsImpact"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsImpact_B_index" ON "_FindingsImpact"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsRecomendation_AB_unique" ON "_FindingsRecomendation"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsRecomendation_B_index" ON "_FindingsRecomendation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsRetestResult_AB_unique" ON "_FindingsRetestResult"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsRetestResult_B_index" ON "_FindingsRetestResult"("B");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_previousBlockId_fkey" FOREIGN KEY ("previousBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsDescription" ADD CONSTRAINT "_FindingsDescription_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsDescription" ADD CONSTRAINT "_FindingsDescription_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsThreat" ADD CONSTRAINT "_FindingsThreat_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsThreat" ADD CONSTRAINT "_FindingsThreat_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsImpact" ADD CONSTRAINT "_FindingsImpact_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsImpact" ADD CONSTRAINT "_FindingsImpact_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRecomendation" ADD CONSTRAINT "_FindingsRecomendation_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRecomendation" ADD CONSTRAINT "_FindingsRecomendation_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRetestResult" ADD CONSTRAINT "_FindingsRetestResult_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRetestResult" ADD CONSTRAINT "_FindingsRetestResult_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
