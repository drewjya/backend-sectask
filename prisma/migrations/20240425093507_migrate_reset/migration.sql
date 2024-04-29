/*
  Warnings:

  - Added the required column `type` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('HEADING_1', 'HEADING_2', 'HEADING_3', 'BLOCK_QUOTES', 'BULLET_LIST', 'NUMBERED_LIST', 'CHECKBOX', 'PARAGRAPH', 'DIVIDER', 'FILE', 'IMAGE', 'COLLECTION');

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "fileId" INTEGER,
ADD COLUMN     "isChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "BlockType" NOT NULL,
ALTER COLUMN "content" SET DEFAULT '<p></p>';

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
