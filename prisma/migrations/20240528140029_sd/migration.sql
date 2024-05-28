/*
  Warnings:

  - You are about to drop the column `subprojectMemberId` on the `ProjectMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectMemberId]` on the table `SubprojectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_subprojectMemberId_fkey";

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "subprojectMemberId";

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectMember_projectMemberId_key" ON "SubprojectMember"("projectMemberId");

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
