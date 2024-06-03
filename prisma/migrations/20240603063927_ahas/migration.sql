-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_subProjectId_fkey";

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
