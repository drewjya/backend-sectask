/*
  Warnings:

  - You are about to drop the `_ProjectAttachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectReports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubProjectAttachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubProjectReports` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectPictureId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profilePictureId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('ATTACHMENT', 'REPORT');

-- DropForeignKey
ALTER TABLE "_ProjectAttachments" DROP CONSTRAINT "_ProjectAttachments_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectAttachments" DROP CONSTRAINT "_ProjectAttachments_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectReports" DROP CONSTRAINT "_ProjectReports_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectReports" DROP CONSTRAINT "_ProjectReports_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubProjectAttachments" DROP CONSTRAINT "_SubProjectAttachments_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubProjectAttachments" DROP CONSTRAINT "_SubProjectAttachments_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubProjectReports" DROP CONSTRAINT "_SubProjectReports_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubProjectReports" DROP CONSTRAINT "_SubProjectReports_B_fkey";

-- DropTable
DROP TABLE "_ProjectAttachments";

-- DropTable
DROP TABLE "_ProjectReports";

-- DropTable
DROP TABLE "_SubProjectAttachments";

-- DropTable
DROP TABLE "_SubProjectReports";

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubprojectFile" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "subprojectId" INTEGER NOT NULL,
    "type" "FileType" NOT NULL,

    CONSTRAINT "SubprojectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingFile" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,

    CONSTRAINT "FindingFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_fileId_key" ON "ProjectFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectFile_fileId_key" ON "SubprojectFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FindingFile_fileId_key" ON "FindingFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectPictureId_key" ON "Project"("projectPictureId");

-- CreateIndex
CREATE UNIQUE INDEX "User_profilePictureId_key" ON "User"("profilePictureId");

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectFile" ADD CONSTRAINT "SubprojectFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectFile" ADD CONSTRAINT "SubprojectFile_subprojectId_fkey" FOREIGN KEY ("subprojectId") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingFile" ADD CONSTRAINT "FindingFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingFile" ADD CONSTRAINT "FindingFile_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
