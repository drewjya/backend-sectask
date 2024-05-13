import { HttpStatus } from '@nestjs/common';
import {
  Project,
  ProjectRole,
  RecentActivities,
  SubprojectRole,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
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
export interface RecentActivitiesRes extends RecentActivities {
  documentId: number;
  type: DocType;
}

export class ProjectQuery {
  constructor(private prisma: PrismaService) {}

  async getProjectByStatus(params: { userId: number; active: boolean }) {
    const project = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: params.userId,
          },
        },
        archived: !params.active,
      },
    });
    return project;
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

    return;
  }
  async checkIfSubprojectActive(params: {
    subproject: number;
    userId: number;
    role: SubprojectRole[];
    onSubProject?: OnSubProject;
  }) {
    const { subproject, userId, role } = params;
    const subprojectData = await this.prisma.subProject.findFirst({
      where: {
        id: subproject,
      },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
        project: {
          select: {
            archived: true,
          },
        },
      },
    });
    if (!subprojectData) {
      throw notfound;
    }
    if (subprojectData.project.archived) {
      throw new ApiException({
        status: HttpStatus.BAD_REQUEST,
        data: 'subproject_is_archived',
      });
    }
    const member = subprojectData.members.find(
      (member) => member.userId === userId,
    );
    if (!member) {
      throw forbidden;
    }
    if (!role.includes(member.role)) {
      throw forbidden;
    }
    params.onSubProject?.call(subprojectData);
    return;
  }

  async updateRecentActivities(param: {
    title: string;
    description: string;
    recentActivitiesId: number;
  }) {
    return await this.prisma.recentActivities.update({
      where: {
        id: param.recentActivitiesId,
      },
      data: {
        title: param.title,
        description: param.description,
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
                        role: true,
                      },
                    },
                    name: true,
                    recentActivities: true,
                    findings: {
                      select: {
                        id: true,
                        name: true,
                        recentActivities: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    let activities: RecentActivitiesRes[] = [];
    recentActivities.projects.forEach(({ project, role }) => {
      activities.push({
        ...project.recentActivities,
        documentId: project.id,
        type: DocType.PROJECT,
      });
      if (role !== ProjectRole.VIEWER) {
        project.subProjects.forEach((subProject) => {
          activities.push({
            ...subProject.recentActivities,
            documentId: subProject.id,
            type: DocType.SUBPROJECT,
          });
          subProject.findings.forEach((finding) => {
            activities.push({
              ...finding.recentActivities,
              documentId: finding.id,
              type: DocType.FINDING,
            });
          });
        });
      } else {
        project.subProjects.forEach((subProject) => {
          const subprojectMember = subProject.members.find(
            (member) => member.userId === userId,
          );
          if (
            subprojectMember &&
            subprojectMember.role === SubprojectRole.CONSULTANT
          ) {
            activities.push({
              ...subProject.recentActivities,
              documentId: subProject.id,
              type: DocType.SUBPROJECT,
            });
            subProject.findings.forEach((finding) => {
              activities.push({
                ...finding.recentActivities,
                documentId: finding.id,
                type: DocType.FINDING,
              });
            });
          }
        });
      }
    });
    return activities;
  }
}
