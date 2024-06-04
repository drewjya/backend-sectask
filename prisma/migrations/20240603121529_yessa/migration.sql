-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DESCRIPTION', 'THREAT');

-- CreateTable
CREATE TABLE "VersionList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "findingId" INTEGER NOT NULL,
    "tyoe" "DocumentType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "basedOn" TIMESTAMP(3),

    CONSTRAINT "VersionList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VersionList" ADD CONSTRAINT "VersionList_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
