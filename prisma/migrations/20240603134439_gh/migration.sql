/*
  Warnings:

  - Added the required column `userId` to the `VersionList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VersionList" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "VersionList" ADD CONSTRAINT "VersionList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
