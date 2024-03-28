/*
  Warnings:

  - You are about to drop the column `recentActivitesId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivitesId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivitesId` on the `SubProject` table. All the data in the column will be lost.
  - You are about to drop the `RecentActivites` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recentActivitiesId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recentActivitiesId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recentActivitiesId` to the `SubProject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Finding" DROP CONSTRAINT "Finding_recentActivitesId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_recentActivitesId_fkey";

-- DropForeignKey
ALTER TABLE "SubProject" DROP CONSTRAINT "SubProject_recentActivitesId_fkey";

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "recentActivitesId",
ADD COLUMN     "recentActivitiesId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "recentActivitesId",
ADD COLUMN     "recentActivitiesId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubProject" DROP COLUMN "recentActivitesId",
ADD COLUMN     "recentActivitiesId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "RecentActivites";

-- CreateTable
CREATE TABLE "RecentActivities" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecentActivities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
