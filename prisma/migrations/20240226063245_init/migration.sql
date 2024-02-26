/*
  Warnings:

  - Added the required column `projectId` to the `SubProject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubProject" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
