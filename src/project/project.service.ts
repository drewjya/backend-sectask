import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { notfound } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';
import { CreateProjectDto } from './request/project.request';

@Injectable()
export class ProjectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
  }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    let members: { role: ProjectRole; userId: number }[] = [
      { role: ProjectRole.PM, userId: userId },
    ];
    if (createProjectDto.members.length > 0) {
      members = [...members, ...createProjectDto.members];
    }
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        archived: false,
        endDate: createProjectDto.endDate,
        startDate: createProjectDto.startDate,
        members: {
          create: members,
        },
        owner: {
          connect: {
            id: userId,
          },
        },

        reports: {},
        recentActivities: {
          create: {
            title: `Project [${createProjectDto.name}] Created`,
            description: `Project [${createProjectDto.name}] has been created by [${userId}]`,
          },
        },
      },
    });
    return project;
  }

  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        attachments: true,
        reports: true,
        recentActivities: {
          select: {
            title: true,
            description: true,
            createdAt: true,
          },
        },
        projectPicture: true,
        members: {
          select: {
            role: true,
            member: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subProjects: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
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
          },
        },
      },
    });
    if (!project) {
      throw notfound;
    }
    const isMember = project.members.some(
      (member) => member.member.id === userId,
    );
    if (!isMember) {
      throw notfound;
    }
    const members = project.members.map((member) => {
      return {
        role: member.role,
        id: member.member.id,
        name: member.member.name,
      };
    });
    return {
      ...project,
      members,
    };
  }

  findActiveProject(userId: number) {
    return this.projectQuery.getProjectByStatus({ userId, active: true });
  }

  findSidebarProject(userId: number) {
    return this.projectQuery.getProjectSidebar({ userId, active: true });
  }

  findSidebarSubProject(userId: number, projectId: number) {
    return this.projectQuery.getSubprojectSidebar({
      userId,
      projectId,
    });
  }
  findSidebarFInding(userId: number, subprojectId: number) {
    return this.projectQuery.getFindingSidebar({
      userId,
      subprojectId,
    });
  }

  findArchivedProject(userId: number) {
    return this.projectQuery.getProjectByStatus({ userId, active: false });
  }

  async findRecentUpdates(userId: number) {
    return this.projectQuery.fetchRecentActivitiesByUserId(userId);
  }

  async archivedProject(projectId: number, userId: number) {
    await this.projectQuery.checkIfProjectActive({
      projectId,
      userId,
      role: [ProjectRole.PM],
    });
    const project = await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        archived: true,
      },
    });
    await this.projectQuery.addProjectRecentActivities({
      projectId: project.id,
      title: `Project ${project.name}`,
      description: 'Project has been archived',
    });
  }

  async searchMember(param: { email: string; projectId: number }) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: param.email,
        },
        projects: {
          none: {
            id: param.projectId,
          },
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });
    return users;
  }
  async searchMemberInit(param: { email: string; userId: number }) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: param.email,
        },
        NOT: {
          id: param.userId,
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });
    return users;
  }

  async addMember(param: {
    userId: number;
    role: ProjectRole;
    projectId: number;
    adminId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.adminId,
      role: [ProjectRole.PM],
    });
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId,
      },
    });
    if (!user) {
      throw notfound;
    }
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: param.projectId,
        userId: param.userId,
      },
    });
    if (projectMember) {
      throw new ApiException({
        status: HttpStatus.FORBIDDEN,
        data: 'duplicate',
      });
    }

    const project = await this.prisma.project.update({
      where: {
        id: param.projectId,
      },
      data: {
        members: {
          create: {
            userId: param.userId,
            role: param.role,
          },
        },
      },
      include: {
        subProjects: {
          select: {
            name: true,
            id: true,
            recentActivities: true,
          },
        },
      },
    });
    await this.projectQuery.addProjectRecentActivities({
      projectId: project.id,
      title: `Project ${project.name}`,
      description: `${user.name} has been added`,
    });

    return project;
  }

  async removeMember(param: {
    userId: number;
    projectId: number;
    adminId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.adminId,
      role: [ProjectRole.PM],
    });

    const findProjectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: param.projectId,
        userId: param.userId,
      },
      include: {
        subprojectMember: {
          include: {
            subproject: true,
          },
        },
        project: true,
        member: true,
      },
    });

    if (!findProjectMember) {
      throw notfound;
    }
    const subprojects = findProjectMember.subprojectMember;

    await this.prisma.projectMember.delete({
      where: {
        id: findProjectMember.id,
      },
    });

    for (const iterator of subprojects) {
      await this.projectQuery.addSubProjectRecentActivities({
        subprojectId: iterator.subproject.id,
        title: `Subproject ${iterator.subproject.name}`,
        description: `${findProjectMember.member.name} has been removed`,
      });
    }

    await this.projectQuery.addProjectRecentActivities({
      projectId: findProjectMember.project.id,
      title: `Project ${findProjectMember.project.name}`,
      description: `${findProjectMember.member.name} has been removed`,
    });

    return true;
  }

  async editHeader(param: {
    userId: number;
    projectId: number;
    name: string;
    startDate: Date;
    endDate: Date;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    return this.prisma.project.update({
      where: {
        id: param.projectId,
      },
      data: {
        name: param.name,
        startDate: param.startDate,
        endDate: param.endDate,
      },
    });
  }

  async editProfileProject(param: {
    projectId: number;
    file: Express.Multer.File;

    userId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    const project = await this.prisma.file.create({
      data: {
        name: param.file.filename,

        contentType: param.file.mimetype,
        imagePath: param.file.path,
        project: {
          connect: {
            id: param.projectId,
          },
        },
      },
    });
    return project;
  }

  async deleteProjectProfile(param: {
    projectId: number;

    userId: number;
  }) {
    const find = await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    if (!find.projectPictureId) {
      throw notfound;
    }

    const file = await this.prisma.file.delete({
      where: {
        id: find.projectPictureId,
      },
    });

    unlinkFile(file.imagePath);
    return;
  }

  async uploadProjectFile(param: {
    projectId: number;
    file: Express.Multer.File;
    originalName: string;
    userId: number;
    acceptRole: ProjectRole[];
    type: 'attachment' | 'report';
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
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
          projectAttachments: {
            connect: {
              id: param.projectId,
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
              id: param.projectId,
            },
          },
        },
      });
      return attachment;
    }
  }

  async removeProjectFile(param: {
    projectId: number;
    fileId: number;
    userId: number;
    acceptRole: ProjectRole[];
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
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
