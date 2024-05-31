import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { noaccess, notfound } from 'src/utils/exception/common.exception';
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
    add: boolean;
    memberId: number;
  }) {
    const subproject = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    const projectMembers = await this.prisma.projectMember.findFirst({
      where: {
        projectId: subproject.project.id,
        userId: param.memberId,
      },
      include: {
        subprojectMember: true,
      },
    });
    if (!projectMembers) {
      throw noaccess;
    }
    const approvedRole: ProjectRole = ProjectRole.VIEWER;
    if (approvedRole !== projectMembers.role) {
      throw noaccess;
    }
    if (param.add) {
      const check = projectMembers.subprojectMember.find(
        (e) =>
          e.subprojectId === param.subprojectId && e.userId === param.memberId,
      );
      console.log(check);

      if (check) {
        throw new ApiException({
          data: 'Member consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.prisma.subprojectMember.create({
        data: {
          projectMember: {
            connect: {
              id: projectMembers.id,
            },
          },
          subproject: {
            connect: {
              id: param.subprojectId,
            },
          },
          user: {
            connect: {
              id: param.memberId,
            },
          },
        },
      });
    } else {
      if (!projectMembers.subprojectMember) {
        throw new ApiException({
          data: 'Member not consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const check = projectMembers.subprojectMember.find(
        (member) => member.subprojectId === param.subprojectId,
      );
      if (!check) {
        throw new ApiException({
          data: 'Member not consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.prisma.subprojectMember.delete({
        where: {
          id: check.id,
        },
      });
    }
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Member ${param.add ? 'Promotion' : 'Demoted'}`,
      description: `Member has been ${param.add ? 'Promoted To Consultant' : 'Demoted To Viewer'} by [${param.userId}]`,
    });
    return subproject;
  }

  async findDetail(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [
        ProjectRole.DEVELOPER,
        ProjectRole.VIEWER,
        ProjectRole.PM,
        ProjectRole.TECHNICAL_WRITER,
      ],
    });
    const subproject = await this.prisma.subProject.findFirst({
      where: {
        id: param.subprojectId,
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        recentActivities: {
          select: {
            title: true,
            description: true,
            createdAt: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                member: true,
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

    const consultants = subproject.members.map((member) => {
      return member.user.id;
    });
    const subprojectMember = subproject.project.members.map((member) => {
      return {
        id: member.userId,
        name: member.member.name,
        role: consultants.includes(member.userId) ? 'CONSULTANT' : member.role,
      };
    });
    delete subproject.members;
    delete subproject.project.members;
    return {
      ...subproject,
      subprojectMember,
    };
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
        reports: {},
        recentActivities: {
          create: {
            title: `Project [${param.name}] Created`,
            description: `Project [${param.name}] has been created by [${param.userId}]`,
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            members: {
              select: {
                userId: true,
              },
            },
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
      role: [ProjectRole.PM],
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
      add: true,
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
      add: false,
    });
    const findingIds = result.findings.map((finding) => {
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
      role: [ProjectRole.PM],
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
    acceptRole: ProjectRole;
    type: 'attachment' | 'report';
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [param.acceptRole],
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
    acceptRole: ProjectRole;
  }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [param.acceptRole],
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
