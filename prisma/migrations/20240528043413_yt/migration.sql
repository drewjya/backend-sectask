/*
  Warnings:

  - You are about to drop the column `cvssDetail` on the `Finding` table. All the data in the column will be lost.
  - Added the required column `cvssDetailId` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "cvssDetail",
ADD COLUMN     "cvssDetailId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TesterFinding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TesterFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TesterFinding_userId_findingId_key" ON "TesterFinding"("userId", "findingId");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_cvssDetailId_fkey" FOREIGN KEY ("cvssDetailId") REFERENCES "CvssDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
