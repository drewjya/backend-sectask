/*
  Warnings:

  - You are about to drop the `_FindingsImpact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `findingDate` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_FindingsImpact" DROP CONSTRAINT "_FindingsImpact_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsImpact" DROP CONSTRAINT "_FindingsImpact_B_fkey";

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "application" TEXT,
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "findingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "impact" TEXT,
ADD COLUMN     "likelihood" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "method" TEXT,
ALTER COLUMN "risk" DROP NOT NULL;

-- DropTable
DROP TABLE "_FindingsImpact";

-- CreateTable
CREATE TABLE "_FindingsBusinessImpact" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsBusinessImpact_AB_unique" ON "_FindingsBusinessImpact"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsBusinessImpact_B_index" ON "_FindingsBusinessImpact"("B");

-- AddForeignKey
ALTER TABLE "_FindingsBusinessImpact" ADD CONSTRAINT "_FindingsBusinessImpact_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsBusinessImpact" ADD CONSTRAINT "_FindingsBusinessImpact_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
