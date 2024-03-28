import { Injectable } from '@nestjs/common';
import { ProjectRole, RecentActivities, SubprojectRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

enum DocType {
  PROJECT = 'PROJECT',
  SUBPROJECT = 'SUBPROJECT',
  FINDING = 'FINDING',
}

export interface RecentActivitiesRes extends RecentActivities {
  documentId: number;
  type: DocType;
}


@Injectable()
export class RecentActivitiesRepository {
  constructor(private prisma: PrismaService) {}
  updateRecentActivities(params: {
    id: number;
    data: { title: string; description: string };
  }) {
    const { id, data } = params;
    return this.prisma.recentActivities.update({
      where: {
        id,
      },
      data,
    });
  }

  async findMany(params: { userId: number }) {
    const { userId } = params;
    const projectsWithUserRole = await this.prisma.projectMember.findMany({
      where: {
        memberId: userId,
      },
      include: {
        project: {
          include: {
            recentActivities: true,
            subProjects: {
              include: {
                recentActivities: true,
                members: true,
                findings: {
                  include: {
                    recentActivities: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let updates: RecentActivitiesRes[] = [];
    projectsWithUserRole.forEach(({ role, project }) => {
      updates.push({
        ...project.recentActivities,
        documentId: project.id,
        type: DocType.PROJECT,
      });
      if (
        role === ProjectRole.OWNER ||
        role === ProjectRole.DEVELOPER ||
        role === ProjectRole.TECHNICAL_WRITER
      ) {
        project.subProjects.forEach((subProject) => {
          updates.push({
            ...subProject.recentActivities,
            documentId: subProject.id,
            type: DocType.SUBPROJECT,
          });
          subProject.findings.forEach((finding) => {
            updates.push({
              ...finding.recentActivities,
              documentId: finding.id,
              type: DocType.FINDING,
            });
          });
        });
      } else if (role === ProjectRole.VIEWER) {
        project.subProjects.forEach((subProject) => {
          const subprojectMembers = subProject.members.find(
            (member) => member.userId === userId,
          );
          if (
            subprojectMembers &&
            subprojectMembers.role === SubprojectRole.CONSULTANT
          ) {
            updates.push({
              ...subProject.recentActivities,
              documentId: subProject.id,
              type: DocType.SUBPROJECT,
            });
            subProject.findings.forEach((finding) => {
              updates.push({
                ...finding.recentActivities,
                documentId: finding.id,
                type: DocType.FINDING,
              });
            });
          }
        });
      }
    });
    return updates;
  }
}
