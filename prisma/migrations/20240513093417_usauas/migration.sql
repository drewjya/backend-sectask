/*
  Warnings:

  - Made the column `recentActivitiesId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_recentActivitiesId_fkey";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "recentActivitiesId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
