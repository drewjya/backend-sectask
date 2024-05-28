-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_subprojectMemberId_fkey";

-- AlterTable
ALTER TABLE "ProjectMember" ALTER COLUMN "subprojectMemberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_subprojectMemberId_fkey" FOREIGN KEY ("subprojectMemberId") REFERENCES "SubprojectMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
