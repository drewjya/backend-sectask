-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectPictureId" INTEGER;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectPictureId_fkey" FOREIGN KEY ("projectPictureId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
