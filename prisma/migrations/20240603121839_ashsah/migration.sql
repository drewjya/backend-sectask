/*
  Warnings:

  - You are about to drop the column `tyoe` on the `VersionList` table. All the data in the column will be lost.
  - Added the required column `type` to the `VersionList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VersionList" DROP COLUMN "tyoe",
ADD COLUMN     "type" "DocumentType" NOT NULL;
