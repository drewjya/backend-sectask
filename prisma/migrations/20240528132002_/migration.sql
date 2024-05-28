/*
  Warnings:

  - You are about to drop the column `role` on the `SubprojectMember` table. All the data in the column will be lost.
  - Added the required column `subprojectMemberId` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectMemberId` to the `SubprojectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "subprojectMemberId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubprojectMember" DROP COLUMN "role",
ADD COLUMN     "projectMemberId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_subprojectMemberId_fkey" FOREIGN KEY ("subprojectMemberId") REFERENCES "SubprojectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
