-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_recentActivitiesId_fkey";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "recentActivitiesId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
