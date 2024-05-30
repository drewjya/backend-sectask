/*
  Warnings:

  - A unique constraint covering the columns `[subprojectId,userId,projectMemberId]` on the table `SubprojectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SubprojectMember_projectMemberId_key";

-- DropIndex
DROP INDEX "SubprojectMember_subprojectId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectMember_subprojectId_userId_projectMemberId_key" ON "SubprojectMember"("subprojectId", "userId", "projectMemberId");
