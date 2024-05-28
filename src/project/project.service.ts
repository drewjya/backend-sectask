import { Injectable } from '@nestjs/common';
import { ProjectRole, SubprojectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
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
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        archived: false,
        endDate: createProjectDto.endDate,
        startDate: createProjectDto.startDate,
        members: {
          create: [{ role: 'PM', userId: userId }],
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
        attachments: true,
        reports: true,
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
                role: true,
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
    return project;
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
        projects: {
          none: {
            id: param.projectId,
          },
        },
      },
    });
    if (!user) {
      throw notfound;
    }
    let subprojectRole: SubprojectRole = SubprojectRole.VIEWER;
    if (param.role === ProjectRole.TECHNICAL_WRITER) {
      subprojectRole = SubprojectRole.TECHNICAL_WRITER;
    } else if (param.role === ProjectRole.DEVELOPER) {
      subprojectRole = SubprojectRole.DEVELOPER;
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

    const subprojects = project.subProjects.map((subproject) => subproject);
    for (const iterator of subprojects) {
      await this.prisma.subProject.update({
        where: {
          id: iterator.id,
        },
        data: {
          members: {
            create: {
              projectId: project.id,
              userId: param.userId,
              role: subprojectRole,
            },
          },
        },
      });
      await this.projectQuery.addSubProjectRecentActivities({
        subprojectId: iterator.id,
        title: `Subproject ${iterator.name}`,
        description: `${user.name} has been added`,
      });
    }
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

    const projectMember = await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: param.projectId,
          userId: param.userId,
        },
      },
      select: {
        project: {
          select: {
            id: true,
            name: true,
            subProjects: true,
          },
        },
        member: true,
      },
    });
    await this.prisma.subprojectMember.deleteMany({
      where: {
        projectId: param.projectId,
        userId: param.userId,
      },
    });
    await this.projectQuery.addProjectRecentActivities({
      projectId: projectMember.project.id,
      title: `Project ${projectMember.project.name}`,
      description: `${projectMember.member.name} has been removed`,
    });

    const subprojects = projectMember.project.subProjects;
    for (const iterator of subprojects) {
      await this.prisma.subprojectMember.delete({
        where: {
          subprojectId_userId: {
            subprojectId: iterator.id,
            userId: param.userId,
          },
        },
      });
      await this.projectQuery.addSubProjectRecentActivities({
        subprojectId: iterator.id,
        title: `Subproject ${iterator.name}`,
        description: `${projectMember.member.name} has been removed`,
      });
    }

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
        name: param.file.originalname,
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
          name: param.originalName,
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
          name: param.originalName,
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

    const attachment = await this.prisma.file.delete({
      where: {
        id: param.fileId,
      },
    });

    unlinkFile(attachment.imagePath);
    return attachment;
  }
}
