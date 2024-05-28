/*
  Warnings:

  - You are about to drop the column `findingId` on the `SubprojectMember` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `SubprojectMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubprojectMember" DROP CONSTRAINT "SubprojectMember_findingId_fkey";

-- AlterTable
ALTER TABLE "SubprojectMember" DROP COLUMN "findingId",
ADD COLUMN     "projectId" INTEGER NOT NULL;
