-- CreateEnum
CREATE TYPE "CVSS_VALUE" AS ENUM ('C0', 'C1', 'C2', 'C3');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('VIEWER', 'PM', 'DEVELOPER', 'TECHNICAL_WRITER');

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
    "originalName" TEXT,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubProjectLog" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubProjectLog_pkey" PRIMARY KEY ("id")
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
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
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
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "SubProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubprojectMember" (
    "id" SERIAL NOT NULL,
    "subprojectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "projectMemberId" INTEGER NOT NULL,

    CONSTRAINT "SubprojectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "method" TEXT,
    "environment" TEXT,
    "application" TEXT,
    "impact" TEXT,
    "likelihood" TEXT,
    "latestUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" TEXT,
    "releases" TEXT,
    "descriptionId" TEXT NOT NULL,
    "threatAndRiskId" TEXT NOT NULL,
    "subProjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "cvssDetailId" INTEGER NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesterFinding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TesterFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvssDetail" (
    "id" SERIAL NOT NULL,
    "av" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ac" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "at" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "pr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ui" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "vc" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "vi" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "va" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "sc" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "si" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "sa" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "s" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "au" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "r" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "v" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "re" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "u" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mav" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mac" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mat" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mpr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mui" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mvc" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mvi" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mva" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msc" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msi" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msa" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "cr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ir" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ar" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "e" "CVSS_VALUE" NOT NULL DEFAULT 'C0',

    CONSTRAINT "CvssDetail_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "_ProjectToProjectLog" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SubProjectToSubProjectLog" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatRoomToFinding" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectMember_projectMemberId_key" ON "SubprojectMember"("projectMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "SubprojectMember_subprojectId_userId_key" ON "SubprojectMember"("subprojectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TesterFinding_userId_findingId_key" ON "TesterFinding"("userId", "findingId");

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
CREATE UNIQUE INDEX "_ProjectToProjectLog_AB_unique" ON "_ProjectToProjectLog"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToProjectLog_B_index" ON "_ProjectToProjectLog"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubProjectToSubProjectLog_AB_unique" ON "_SubProjectToSubProjectLog"("A", "B");

-- CreateIndex
CREATE INDEX "_SubProjectToSubProjectLog_B_index" ON "_SubProjectToSubProjectLog"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomToFinding_AB_unique" ON "_ChatRoomToFinding"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomToFinding_B_index" ON "_ChatRoomToFinding"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectPictureId_fkey" FOREIGN KEY ("projectPictureId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_subprojectId_fkey" FOREIGN KEY ("subprojectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubprojectMember" ADD CONSTRAINT "SubprojectMember_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_cvssDetailId_fkey" FOREIGN KEY ("cvssDetailId") REFERENCES "CvssDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "SubProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterFinding" ADD CONSTRAINT "TesterFinding_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_replyChatId_fkey" FOREIGN KEY ("replyChatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "_ProjectToProjectLog" ADD CONSTRAINT "_ProjectToProjectLog_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToProjectLog" ADD CONSTRAINT "_ProjectToProjectLog_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectToSubProjectLog" ADD CONSTRAINT "_SubProjectToSubProjectLog_A_fkey" FOREIGN KEY ("A") REFERENCES "SubProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubProjectToSubProjectLog" ADD CONSTRAINT "_SubProjectToSubProjectLog_B_fkey" FOREIGN KEY ("B") REFERENCES "SubProjectLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToFinding" ADD CONSTRAINT "_ChatRoomToFinding_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomToFinding" ADD CONSTRAINT "_ChatRoomToFinding_B_fkey" FOREIGN KEY ("B") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
