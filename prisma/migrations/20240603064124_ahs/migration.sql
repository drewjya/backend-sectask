-- DropForeignKey
ALTER TABLE "SubprojectMember" DROP CONSTRAINT "SubprojectMember_subprojectId_fkey";

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_subprojectId_fkey" FOREIGN KEY ("subprojectId") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
