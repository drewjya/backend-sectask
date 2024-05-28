import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole, SubprojectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { notfound } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';

@Injectable()
export class SubprojectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
  }
  private async editSubprojectMembers(param: {
    subprojectId: number;
    userId: number;

    memberId: number;
    newRole: SubprojectRole;
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [SubprojectRole.PM],
    });

    const subprojectMembers = await this.prisma.subprojectMember.findFirst({
      where: {
        subprojectId: param.subprojectId,
        userId: param.memberId,
      },
      include: {
        subproject: {
          include: {
            findings: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (!subprojectMembers) {
      throw new ApiException({
        data: 'Member not found',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    const approvedRole: SubprojectRole[] = [
      SubprojectRole.CONSULTANT,
      SubprojectRole.VIEWER,
    ];
    if (
      !approvedRole.includes(subprojectMembers.role) ||
      !approvedRole.includes(param.newRole)
    ) {
      throw new ApiException({
        data: 'Role not allowed',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const subproejct = await this.prisma.subprojectMember.update({
      where: {
        id: subprojectMembers.id,
      },
      data: {
        role: param.newRole,
      },
      include: {
        subproject: {
          include: {
            findings: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Subproject Member Updated`,
      description: `Subproject Member has been updated by [${param.userId}]`,
    });
    return subproejct;
  }

  async findDetail(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [
        SubprojectRole.CONSULTANT,
        SubprojectRole.DEVELOPER,
        SubprojectRole.VIEWER,
        SubprojectRole.PM,
        SubprojectRole.TECHNICAL_WRITER,
      ],
    });
    return this.prisma.subProject.findFirst({
      where: {
        id: param.subprojectId,
      },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        findings: {
          select: {
            id: true,
            name: true,
            createdBy: {
              include: {
                profilePicture: true,
              },
            },
          },
        },
        reports: true,
        attachments: true,
      },
    });
  }

  async createSubproject(param: {
    projectId: number;
    userId: number;
    startDate: Date;
    endDate: Date;
    name: string;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    const projectMembers = await this.prisma.projectMember.findMany({
      where: {
        projectId: param.projectId,
      },
    });

    let subprojectMembers: {
      role: SubprojectRole;
      userId: number;
      projectId: number;
    }[] = [];
    subprojectMembers = projectMembers.map((member) => {
      return {
        projectId: param.projectId,
        role: member.role as SubprojectRole,
        userId: member.userId,
      };
    });
    const subproject = await this.prisma.subProject.create({
      data: {
        name: param.name,
        project: {
          connect: {
            id: param.projectId,
          },
        },
        endDate: param.endDate,
        startDate: param.startDate,
        members: {
          create: subprojectMembers,
        },
        reports: {},
        recentActivities: {
          create: {
            title: `Project [${param.name}] Created`,
            description: `Project [${param.name}] has been created by [${param.userId}]`,
          },
        },
      },
    });
    return subproject;
  }

  async updateSubprojectHeader(param: {
    subprojectId: number;
    userId: number;
    name: string;
    startDate: Date;
    endDate: Date;
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [SubprojectRole.PM],
    });
    const subproject = await this.prisma.subProject.update({
      where: {
        id: param.subprojectId,
      },
      data: {
        name: param.name,
        startDate: param.startDate,
        endDate: param.endDate,
      },
    });
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Subproject [${param.name}] Updated`,
      description: `Subproject [${param.name}] has been updated by [${param.userId}]`,
    });
    return subproject;
  }

  async promoteToConsultant(param: {
    subprojectId: number;
    userId: number;
    memberId: number;
  }) {
    return this.editSubprojectMembers({
      subprojectId: param.subprojectId,
      userId: param.userId,
      memberId: param.memberId,
      newRole: SubprojectRole.CONSULTANT,
    });
  }
  async demoteToViewer(param: {
    subprojectId: number;
    userId: number;
    memberId: number;
  }) {
    let result = await this.editSubprojectMembers({
      subprojectId: param.subprojectId,
      userId: param.userId,
      memberId: param.memberId,
      newRole: SubprojectRole.VIEWER,
    });
    const findingIds = result.subproject.findings.map((finding) => {
      return finding.id;
    });
    await this.prisma.testerFinding.updateMany({
      where: {
        findingId: {
          in: findingIds,
        },
        userId: param.memberId,
      },
      data: {
        active: false,
      },
    });
    return result;
  }

  async deleteSubproject(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [SubprojectRole.PM],
    });
    const subproject = await this.prisma.subProject.delete({
      where: {
        id: param.subprojectId,
      },
    });
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Subproject Deleted`,
      description: `Subproject has been deleted by [${param.userId}]`,
    });
    return subproject;
  }


  async uploadProjectFile(param: {
    subprojectId: number;
    file: Express.Multer.File;
    originalName: string;
    userId: number;
    acceptRole: SubprojectRole[];
    type: 'attachment' | 'report';
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: param.acceptRole,
    });
    if (param.type === 'attachment') {
      const attachment = await this.prisma.file.create({
        data: {
          name: param.file.filename,
          originalName: param.originalName,
          contentType: param.file.mimetype,
          imagePath: param.file.path,
          subProjectAttachments: {
            connect: {
              id: param.subprojectId,
            },
          },
        },
      });
      return attachment;
    } else {
      const attachment = await this.prisma.file.create({
        data: {
          name: param.file.filename,
          originalName: param.originalName,
          contentType: param.file.mimetype,
          imagePath: param.file.path,
          projectReports: {
            connect: {
              id: param.subprojectId,
            },
          },
        },
      });
      return attachment;
    }
  }

  async removeProjectFile(param: {
    subprojectId: number;
    fileId: number;
    userId: number;
    acceptRole: ProjectRole[];
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: param.acceptRole,
    });

    const file = await this.prisma.file.findFirst({
      where: {
        id: param.fileId,
      },
    });
    if (!file) {
      throw notfound;
    }
    const attachment = await this.prisma.file.delete({
      where: {
        id: param.fileId,
      },
    });

    unlinkFile(attachment.imagePath);
    return attachment;
  }
}
