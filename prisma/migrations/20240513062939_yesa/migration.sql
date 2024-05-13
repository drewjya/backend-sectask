-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('HEADING_1', 'HEADING_2', 'HEADING_3', 'BLOCK_QUOTES', 'BULLET_LIST', 'NUMBERED_LIST', 'CHECKBOX', 'PARAGRAPH', 'DIVIDER', 'FILE', 'IMAGE', 'COLLECTION');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('PICTURE', 'FILE', 'STRING', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'DATE');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('VIEWER', 'OWNER', 'DEVELOPER', 'TECHNICAL_WRITER');

-- CreateEnum
CREATE TYPE "SubprojectRole" AS ENUM ('PM', 'DEVELOPER', 'TECHNICAL_WRITER', 'GUEST', 'CONSULTANT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePictureId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "projectPictureId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "recentActivitiesId" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubProject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "recentActivitiesId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "chatRoomId" INTEGER NOT NULL,

    CONSTRAINT "SubProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubprojectMember" (
    "id" SERIAL NOT NULL,
    "role" "SubprojectRole" NOT NULL,
    "subprojectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubprojectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "risk" TEXT,
    "location" TEXT,
    "method" TEXT,
    "environment" TEXT,
    "application" TEXT,
    "impact" TEXT,
    "likelihood" TEXT,
    "findingDate" TIMESTAMP(3) NOT NULL,
    "subProjectId" INTEGER NOT NULL,
    "recentActivitiesId" INTEGER NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '<p></p>',
    "type" "BlockType" NOT NULL DEFAULT 'PARAGRAPH',
    "fileId" INTEGER,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "previousBlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tableEntryId" INTEGER,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "replyChatId" INTEGER,
    "userId" INTEGER NOT NULL,
    "chatRoomId" INTEGER,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableEntry" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableHeader" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EntryType" NOT NULL DEFAULT 'STRING',
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "tableEntryId" INTEGER,

    CONSTRAINT "TableHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "tableHeaderId" INTEGER NOT NULL,
    "fileId" INTEGER,

    CONSTRAINT "TableValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColumnValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ColumnValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectAttachments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectReports" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SubProjectAttachments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SubProjectReports" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsDescription" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsThreat" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsBusinessImpact" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsRecomendation" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FindingsRetestResult" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_memberId_key" ON "ProjectMember"("projectId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectMember_subprojectId_userId_key" ON "SubprojectMember"("subprojectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_previousBlockId_key" ON "Block"("previousBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectAttachments_AB_unique" ON "_ProjectAttachments"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectAttachments_B_index" ON "_ProjectAttachments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectReports_AB_unique" ON "_ProjectReports"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectReports_B_index" ON "_ProjectReports"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubProjectAttachments_AB_unique" ON "_SubProjectAttachments"("A", "B");

-- CreateIndex
CREATE INDEX "_SubProjectAttachments_B_index" ON "_SubProjectAttachments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubProjectReports_AB_unique" ON "_SubProjectReports"("A", "B");

-- CreateIndex
CREATE INDEX "_SubProjectReports_B_index" ON "_SubProjectReports"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsDescription_AB_unique" ON "_FindingsDescription"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsDescription_B_index" ON "_FindingsDescription"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsThreat_AB_unique" ON "_FindingsThreat"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsThreat_B_index" ON "_FindingsThreat"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsBusinessImpact_AB_unique" ON "_FindingsBusinessImpact"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsBusinessImpact_B_index" ON "_FindingsBusinessImpact"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsRecomendation_AB_unique" ON "_FindingsRecomendation"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsRecomendation_B_index" ON "_FindingsRecomendation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FindingsRetestResult_AB_unique" ON "_FindingsRetestResult"("A", "B");

-- CreateIndex
CREATE INDEX "_FindingsRetestResult_B_index" ON "_FindingsRetestResult"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectPictureId_fkey" FOREIGN KEY ("projectPictureId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_subprojectId_fkey" FOREIGN KEY ("subprojectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_recentActivitiesId_fkey" FOREIGN KEY ("recentActivitiesId") REFERENCES "RecentActivities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_previousBlockId_fkey" FOREIGN KEY ("previousBlockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_tableEntryId_fkey" FOREIGN KEY ("tableEntryId") REFERENCES "TableEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_replyChatId_fkey" FOREIGN KEY ("replyChatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableHeader" ADD CONSTRAINT "TableHeader_tableEntryId_fkey" FOREIGN KEY ("tableEntryId") REFERENCES "TableEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableValue" ADD CONSTRAINT "TableValue_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableValue" ADD CONSTRAINT "TableValue_tableHeaderId_fkey" FOREIGN KEY ("tableHeaderId") REFERENCES "TableHeader"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAttachments" ADD CONSTRAINT "_ProjectAttachments_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAttachments" ADD CONSTRAINT "_ProjectAttachments_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectReports" ADD CONSTRAINT "_ProjectReports_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectReports" ADD CONSTRAINT "_ProjectReports_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectAttachments" ADD CONSTRAINT "_SubProjectAttachments_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectAttachments" ADD CONSTRAINT "_SubProjectAttachments_B_fkey" FOREIGN KEY ("B") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectReports" ADD CONSTRAINT "_SubProjectReports_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectReports" ADD CONSTRAINT "_SubProjectReports_B_fkey" FOREIGN KEY ("B") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsDescription" ADD CONSTRAINT "_FindingsDescription_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsDescription" ADD CONSTRAINT "_FindingsDescription_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsThreat" ADD CONSTRAINT "_FindingsThreat_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsThreat" ADD CONSTRAINT "_FindingsThreat_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsBusinessImpact" ADD CONSTRAINT "_FindingsBusinessImpact_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsBusinessImpact" ADD CONSTRAINT "_FindingsBusinessImpact_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRecomendation" ADD CONSTRAINT "_FindingsRecomendation_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRecomendation" ADD CONSTRAINT "_FindingsRecomendation_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRetestResult" ADD CONSTRAINT "_FindingsRetestResult_A_fkey" FOREIGN KEY ("A") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FindingsRetestResult" ADD CONSTRAINT "_FindingsRetestResult_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
