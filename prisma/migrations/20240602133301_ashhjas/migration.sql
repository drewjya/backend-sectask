/*
  Warnings:

  - You are about to drop the `DocumentWrapper` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `findings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tester_findings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_findingId_fkey";

-- DropForeignKey
ALTER TABLE "CvssDetail" DROP CONSTRAINT "CvssDetail_findingId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentWrapper" DROP CONSTRAINT "DocumentWrapper_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentWrapper" DROP CONSTRAINT "DocumentWrapper_findingId_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_subProjectId_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_userId_fkey";

-- DropForeignKey
ALTER TABLE "tester_findings" DROP CONSTRAINT "tester_findings_findingId_fkey";

-- DropForeignKey
ALTER TABLE "tester_findings" DROP CONSTRAINT "tester_findings_userId_fkey";

-- DropTable
DROP TABLE "DocumentWrapper";

-- DropTable
DROP TABLE "findings";

-- DropTable
DROP TABLE "tester_findings";

-- DropEnum
DROP TYPE "DocType";

-- CreateTable
CREATE TABLE "Finding" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "method" TEXT,
    "environment" TEXT,
    "application" TEXT,
    "impact" TEXT,
    "likelihood" TEXT,
    "latestUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" TEXT,
    "releases" TEXT,
    "subProjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "threatAndRiskId" TEXT NOT NULL,
    "descriptionId" TEXT NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetestHistory" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "testerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "findingId" INTEGER,

    CONSTRAINT "RetestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesterFinding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TesterFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TesterFinding_userId_findingId_key" ON "TesterFinding"("userId", "findingId");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetestHistory" ADD CONSTRAINT "RetestHistory_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetestHistory" ADD CONSTRAINT "RetestHistory_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvssDetail" ADD CONSTRAINT "CvssDetail_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
