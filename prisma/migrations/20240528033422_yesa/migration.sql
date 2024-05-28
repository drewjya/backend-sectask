/*
  Warnings:

  - You are about to drop the column `findingDate` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivitiesId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `risk` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivitiesId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivitiesId` on the `SubProject` table. All the data in the column will be lost.
  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ColumnValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecentActivities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TableEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TableHeader` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TableValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FindingsBusinessImpact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FindingsDescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FindingsRecomendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FindingsRetestResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FindingsThreat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessImpactId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendationId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retestResultId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threatAndRiskId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_previousBlockId_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_tableEntryId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_recentActivitiesId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_recentActivitiesId_fkey";

-- DropForeignKey
ALTER TABLE "SubProject" DROP CONSTRAINT "SubProject_recentActivitiesId_fkey";

-- DropForeignKey
ALTER TABLE "TableHeader" DROP CONSTRAINT "TableHeader_tableEntryId_fkey";

-- DropForeignKey
ALTER TABLE "TableValue" DROP CONSTRAINT "TableValue_fileId_fkey";

-- DropForeignKey
ALTER TABLE "TableValue" DROP CONSTRAINT "TableValue_tableHeaderId_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsBusinessImpact" DROP CONSTRAINT "_FindingsBusinessImpact_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsBusinessImpact" DROP CONSTRAINT "_FindingsBusinessImpact_B_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsDescription" DROP CONSTRAINT "_FindingsDescription_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsDescription" DROP CONSTRAINT "_FindingsDescription_B_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsRecomendation" DROP CONSTRAINT "_FindingsRecomendation_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsRecomendation" DROP CONSTRAINT "_FindingsRecomendation_B_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsRetestResult" DROP CONSTRAINT "_FindingsRetestResult_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsRetestResult" DROP CONSTRAINT "_FindingsRetestResult_B_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsThreat" DROP CONSTRAINT "_FindingsThreat_A_fkey";

-- DropForeignKey
ALTER TABLE "_FindingsThreat" DROP CONSTRAINT "_FindingsThreat_B_fkey";

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "findingDate",
DROP COLUMN "recentActivitiesId",
DROP COLUMN "risk",
ADD COLUMN     "businessImpactId" TEXT NOT NULL,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "descriptionId" TEXT NOT NULL,
ADD COLUMN     "latestUpdate" TIMESTAMP(3),
ADD COLUMN     "recommendationId" TEXT NOT NULL,
ADD COLUMN     "releases" TEXT,
ADD COLUMN     "retestResultId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "threatAndRiskId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "recentActivitiesId";

-- AlterTable
ALTER TABLE "SubProject" DROP COLUMN "recentActivitiesId";

-- AlterTable
ALTER TABLE "SubprojectMember" ADD COLUMN     "findingId" INTEGER;

-- DropTable
DROP TABLE "Block";

-- DropTable
DROP TABLE "ColumnValue";

-- DropTable
DROP TABLE "RecentActivities";

-- DropTable
DROP TABLE "TableEntry";

-- DropTable
DROP TABLE "TableHeader";

-- DropTable
DROP TABLE "TableValue";

-- DropTable
DROP TABLE "_FindingsBusinessImpact";

-- DropTable
DROP TABLE "_FindingsDescription";

-- DropTable
DROP TABLE "_FindingsRecomendation";

-- DropTable
DROP TABLE "_FindingsRetestResult";

-- DropTable
DROP TABLE "_FindingsThreat";

-- DropEnum
DROP TYPE "BlockType";

-- CreateTable
CREATE TABLE "ProjectLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubProjectLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubProjectLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToProjectLog" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SubProjectToSubProjectLog" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToProjectLog_AB_unique" ON "_ProjectToProjectLog"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToProjectLog_B_index" ON "_ProjectToProjectLog"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubProjectToSubProjectLog_AB_unique" ON "_SubProjectToSubProjectLog"("A", "B");

-- CreateIndex
CREATE INDEX "_SubProjectToSubProjectLog_B_index" ON "_SubProjectToSubProjectLog"("B");

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_businessImpactId_fkey" FOREIGN KEY ("businessImpactId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_retestResultId_fkey" FOREIGN KEY ("retestResultId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectLog" ADD CONSTRAINT "_ProjectToProjectLog_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectLog" ADD CONSTRAINT "_ProjectToProjectLog_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectToSubProjectLog" ADD CONSTRAINT "_SubProjectToSubProjectLog_A_fkey" FOREIGN KEY ("A") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectToSubProjectLog" ADD CONSTRAINT "_SubProjectToSubProjectLog_B_fkey" FOREIGN KEY ("B") REFERENCES "SubProjectLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
