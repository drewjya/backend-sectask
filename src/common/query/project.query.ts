import { HttpStatus } from '@nestjs/common';
import {
  PrismaClient,
  Project,
  ProjectRole
} from '@prisma/client';
import { ApiException } from 'src/utils/exception/api.exception';
import { forbidden, notfound } from 'src/utils/exception/common.exception';
type OnProject = (value: Project) => void;
type OnSubProject = (value: {
  project: {
    archived: boolean;
  };
}) => void;
enum DocType {
  PROJECT = 'PROJECT',
  SUBPROJECT = 'SUBPROJECT',
  FINDING = 'FINDING',
}
export interface ProjectLogRes {
  documentId: number;
  type: DocType;
  title: string;
  description: string;
  createdAt: Date;
}

export class ProjectQuery {
  constructor(private prisma: PrismaClient) { }

  async getProjectByStatus(params: { userId: number; active: boolean }) {
    const today = () => {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      return day
    }
    const project = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: params.userId,
          },
        },
        endDate: params.active ? {
          gte: (today())
        } : {
          lte: (today())
        },
      },
      select: {
        id: true,
        owner: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        name: true,
        projectPicture: true,
        startDate: true,
        endDate: true,
      },
    });
    return project;
  }

  async getProjectSidebar(params: { userId: number; active: boolean }) {
    const today = () => {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      return day
    }
    const project = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: params.userId,
          },
        },
        endDate: params.active ? {
          gte: (today())
        } : undefined,
      },
      select: {
        name: true,
        id: true,
      },
    });
    return project;
  }

  async getSubprojectSidebar(params: { userId: number; projectId: number }) {

    const subprojects = await this.prisma.project.findFirst({
      where: {
        id: params.projectId,

        members: {
          some: {
            userId: params.userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        subProjects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });


    return subprojects.subProjects;
  }

  async getFindingSidebar(params: { userId: number; subprojectId: number }) {
    const findings = await this.prisma.finding.findMany({
      where: {
        subProjectId: params.subprojectId,
        subProject: {
          project: {
            members: {
              some: {
                userId: params.userId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return findings;
  }

  async checkIfProjectActive(params: {
    projectId: number;
    userId: number;
    role: ProjectRole[];
    onProject?: OnProject;
  }) {
    const { projectId, userId, role, onProject } = params;
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });
    if (!project) {
      throw notfound;
    }

    const member = project.members.find((member) => member.userId === userId);
    if (!member) {
      throw forbidden;
    }
    if (!role.includes(member.role)) {
      throw forbidden;
    }
    onProject?.call(project);

    return project;
  }
  async checkIfSubprojectActive(params: {
    subproject: number;
    userId: number;
    role: ProjectRole[];
    onSubProject?: OnSubProject;
  }) {
    const { subproject, userId } = params;
    const subprojectData = await this.prisma.subProject.findFirst({
      where: {
        id: subproject,
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                name: true
              }
            },
            userId: true,
          },
        },

        project: {
          include: {
            owner: true,
            members: {
              include: {
                member: true,
              },
            },
          },
        },
        findings: true,
      },
    });

    if (!subprojectData) {
      throw notfound;
    }
    if (!subprojectData.project) {
      throw new ApiException({
        status: HttpStatus.BAD_REQUEST,
        data: 'archived',
      });
    }
    const member = subprojectData.project.members.find(
      (member) => member.userId === userId && params.role.includes(member.role),
    );
    if (!member) {
      throw forbidden;
    }

    params.onSubProject?.call(subprojectData);
    return subprojectData;
  }

  async addProjectRecentActivities(param: {
    title?: string;
    description: string;
    projectId: number;
  }) {
    return await this.prisma.projectLog.create({
      data: {
        title: param.title,
        description: param.description,
        project: {
          connect: {
            id: param.projectId,
          },
        },
      },
    });
  }

  async addSubProjectRecentActivities(param: {
    title?: string;
    description: string;
    subprojectId: number;
  }) {
    return await this.prisma.subProjectLog.create({
      data: {
        title: param.title,
        description: param.description,
        subproject: {
          connect: {
            id: param.subprojectId,
          },
        },
      },
    });
  }

  async fetchRecentActivitiesByUserId(userId: number) {
    const recentActivities = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        projects: {
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                recentActivities: true,

                subProjects: {
                  select: {
                    id: true,
                    members: {
                      select: {
                        userId: true,
                      },
                    },
                    name: true,
                    recentActivities: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    let activities: ProjectLogRes[] = [];
    recentActivities.projects.forEach(({ project, role }) => {
      project.recentActivities.forEach((e) => {
        activities.push({
          ...e,
          documentId: project.id,
          type: DocType.PROJECT,
        });
      });
      if (role !== ProjectRole.VIEWER) {
        project.subProjects.forEach((subProject) => {
          subProject.recentActivities.forEach((e) => {
            activities.push({
              ...e,

              documentId: subProject.id,
              type: DocType.SUBPROJECT,
            });
          });
        });
      }
    });
    activities.sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    });
    activities = activities.slice(0, 5);
    return activities;
  }
}
