/*
  Warnings:

  - You are about to drop the `CvssDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Finding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TesterFinding` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_cvssDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_subProjectId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_threatAndRiskId_fkey";

-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_userId_fkey";

-- DropForeignKey
ALTER TABLE "TesterFinding" DROP CONSTRAINT "TesterFinding_findingId_fkey";

-- DropForeignKey
ALTER TABLE "TesterFinding" DROP CONSTRAINT "TesterFinding_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatRoomToFinding" DROP CONSTRAINT "_ChatRoomToFinding_B_fkey";

-- DropTable
DROP TABLE "CvssDetail";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Finding";

-- DropTable
DROP TABLE "TesterFinding";

-- CreateTable
CREATE TABLE "findings" (
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
    "descriptionId" TEXT NOT NULL,
    "threatAndRiskId" TEXT NOT NULL,
    "subProjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "cvssDetailId" INTEGER NOT NULL,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tester_findings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tester_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvss_details" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "cvss_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tester_findings_userId_findingId_key" ON "tester_findings"("userId", "findingId");

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_cvssDetailId_fkey" FOREIGN KEY ("cvssDetailId") REFERENCES "cvss_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tester_findings" ADD CONSTRAINT "tester_findings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tester_findings" ADD CONSTRAINT "tester_findings_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToFinding" ADD CONSTRAINT "_ChatRoomToFinding_B_fkey" FOREIGN KEY ("B") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
