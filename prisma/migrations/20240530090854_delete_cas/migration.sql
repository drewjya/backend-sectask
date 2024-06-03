-- DropForeignKey
ALTER TABLE "SubprojectMember" DROP CONSTRAINT "SubprojectMember_projectMemberId_fkey";

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
