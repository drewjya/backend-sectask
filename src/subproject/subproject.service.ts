import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole, SubprojectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';

@Injectable()
export class SubprojectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
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

  async editSubprojectMembers(param: {
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

    await this.prisma.subprojectMember.update({
      where: {
        id: subprojectMembers.id,
      },
      data: {
        role: param.newRole,
      },
    });
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Subproject Member Updated`,
      description: `Subproject Member has been updated by [${param.userId}]`,
    });
    return subprojectMembers;
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
}
