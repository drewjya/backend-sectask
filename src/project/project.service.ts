import { Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';
import { notfound } from 'src/utils/exception/common.exception';
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
          create: [{ role: 'OWNER', userId: userId }],
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
    return this.projectQuery.getProjectByStatus({ userId, active: true });
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
      role: [ProjectRole.OWNER],
    });
    const project = await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        archived: true,
      },
    });
    await this.projectQuery.updateRecentActivities({
      recentActivitiesId: project.recentActivitiesId,
      title: `${project.name}`,
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
      role: [ProjectRole.OWNER],
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
    });
    await this.projectQuery.updateRecentActivities({
      recentActivitiesId: project.recentActivitiesId,
      title: `${project.name}`,
      description: `${user.name} has been added`,
    });
    return project;
  }
}
