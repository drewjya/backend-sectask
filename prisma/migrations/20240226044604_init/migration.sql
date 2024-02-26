/*
  Warnings:

  - You are about to drop the column `archived` on the `SubProject` table. All the data in the column will be lost.
  - Added the required column `recentActivitesId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recentActivitesId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recentActivitesId` to the `SubProject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "recentActivitesId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "recentActivitesId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubProject" DROP COLUMN "archived",
ADD COLUMN     "recentActivitesId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RecentActivites" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecentActivites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recentActivitesId_fkey" FOREIGN KEY ("recentActivitesId") REFERENCES "RecentActivites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_recentActivitesId_fkey" FOREIGN KEY ("recentActivitesId") REFERENCES "RecentActivites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_recentActivitesId_fkey" FOREIGN KEY ("recentActivitesId") REFERENCES "RecentActivites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
