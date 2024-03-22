import { Injectable } from '@nestjs/common';
import { ProjectRole, SubprojectRole } from '@prisma/client';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private upload: FileUploadService,
  ) {}
  async create(userId: number, createProjectDto: CreateProjectDto) {
    let project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        archived: false,
        endDate: createProjectDto.endDate,
        startDate: createProjectDto.startDate,
        members: {
          create: [{ role: 'OWNER', memberId: userId }],
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
    return {
      name: project.name,
      id: project.id,
    };
  }

  async active(userId: number) {
    let projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            memberId: userId,
          },
        },
        archived: false,
      },
      include: {
        projectPicture: true,
      },
    });
    let result: any[] = [];
    for (const val of projects) {
      let curr = {
        id: val.id,
        name: val.name,
        startDate: val.startDate,
        endDate: val.endDate,
        projectPicture: null,
      };

      if (val.projectPicture) {
        let pict = await this.upload.getFileUrl(
          val.projectPicture.imagePath,
          val.projectPicture.contentType,
        );
        curr.projectPicture = pict;
      }
      result.push(curr);
    }
    return result;
  }

  async findRecentUpdatesByUserId(userId: number) {
    try {
      // Find recent updates for projects
      type RecentUpdates = {
        id: number;
        documentId: number;
        type: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        projectPicture?: string;
      };
      let projectUpdates: Record<number, RecentUpdates> = {};
      const projects = await this.prisma.project.findMany({
        where: {
          members: {
            some: {
              memberId: userId,
            },
          },
        },
        include: {
          members: true,
          recentActivities: true,
          projectPicture: true,
        },
      });
      for (const key of projects) {
        let curr = {
          id: key.recentActivitesId,
          documentId: key.id,
          type: 'PROJECT',
          title: key.recentActivities.title,
          description: key.recentActivities.description,
          createdAt: key.recentActivities.createdAt,
          updatedAt: key.recentActivities.updatedAt,
          projectPicture: null,
        };
        if (key.projectPicture) {
          let pict = await this.upload.getFileUrl(
            key.projectPicture.imagePath,
            key.projectPicture.contentType,
          );
          curr.projectPicture = pict;
        }
        projectUpdates[key.id] = curr;
      }

      // Find recent updates for subprojects
      let subprojectUpdates: Record<number, RecentUpdates> = {};
      const subprojects = await this.prisma.subProject.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: true,

          recentActivities: true,
        },
      });

      for (const key of subprojects) {
        let curr = {
          id: key.recentActivitesId,
          documentId: key.id,
          type: 'SUBPROJECT',
          title: key.recentActivities.title,
          description: key.recentActivities.description,
          createdAt: key.recentActivities.createdAt,
          updatedAt: key.recentActivities.updatedAt,
          projectPicture: null,
        };
        let projectRoot = projectUpdates[key.projectId];
        if (projectRoot) {
          curr.projectPicture = projectRoot.projectPicture;
        }
        subprojectUpdates[key.id] = curr;
      }
      // Find recent updates for findings
      let findingUpdates: Record<number, RecentUpdates> = {};
      const findings = await this.prisma.finding.findMany({
        where: {
          subProject: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
        include: {
          subProject: {
            include: {
              members: true,
            },
          },
          recentActivities: true,
        },
      });
      for (const key of findings) {
        let curr = {
          id: key.recentActivitesId,
          documentId: key.id,
          type: 'FINDINGS',
          title: key.recentActivities.title,
          description: key.recentActivities.description,
          createdAt: key.recentActivities.createdAt,
          updatedAt: key.recentActivities.updatedAt,
          projectPicture: null,
        };
        let subprojectRoot = subprojectUpdates[key.subProjectId];
        if (subprojectRoot) {
          curr.projectPicture = subprojectRoot.projectPicture;
        }
        findingUpdates[key.id] = curr;
      }

      // Combine and return the results
      let recentUpdates = [
        ...Object.values(projectUpdates),
        ...Object.values(subprojectUpdates),
        ...Object.values(findingUpdates),
      ];

      recentUpdates.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
      return recentUpdates;
    } catch (error) {
      throw error;
    }
  }

  async archiveProject(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        archived: false,
        members: {
          some: {
            memberId: userId,
            role: 'OWNER',
          },
        },
      },
    });
    if (project === null) {
      throw new ApiException(404, 'not_found');
    }
    return this.prisma.project.update({
      data: {
        archived: true,
        recentActivities: {
          update: {
            data: {
              title: `Project [${projectId}] Archived`,
              description: `Project [${projectId}] has been archived by [${userId}]`,
            },
          },
        },
      },
      where: {
        id: projectId,
        members: {
          some: {
            memberId: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,

        recentActivities: true,
      },
    });
  }

  async searchMember(email: string, projectId: number) {
    let users = await this.prisma.user.findMany({
      where: {
        projects: {
          none: {
            projectId: projectId,
          },
        },
        email: {
          startsWith: email,
        },
      },
    });

    let result: {
      id: number;
      email: string;
      name: string;
    }[] = [];
    for (const item of users) {
      result.push({
        id: item.id,
        email: item.email,
        name: item.name,
      });
    }
    return result;
  }

  async addMember(
    projectId: number,
    userId: number,
    ownerId: number,
    role: ProjectRole,
  ) {
    let project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            memberId: ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
        recentActivities: true,
      },
    });
    if (project === null) {
      throw new ApiException(404, 'unauthorized');
    }

    let isMember = project.members.some((val) => val.memberId === userId);
    if (isMember) {
      throw new ApiException(400, 'already_member');
    }
    const newMember = await this.prisma.project.update({
      data: {
        members: {
          create: {
            memberId: userId,
            role: role,
          },
        },
        recentActivities: {
          update: {
            data: {
              title: `Member [${userId}] Added to Project [${projectId}]`,
              description: `Member [${userId}] has been added to Project [${projectId}]`,
            },
            where: {
              id: project.recentActivities.id,
            },
          },
        },
      },
      where: {
        id: projectId,
      },
    });
    let subProjectRole: SubprojectRole;
    switch (role) {
      case ProjectRole.DEVELOPER:
        subProjectRole = SubprojectRole.DEVELOPER;
        break;
      case ProjectRole.TECHNICAL_WRITER:
        subProjectRole = SubprojectRole.TECHNICAL_WRITER;
        break;
      case ProjectRole.VIEWER:
        subProjectRole = SubprojectRole.GUEST;
        break;

      default:
        throw new ApiException(400, 'invalid_role');
    }

    let subproject = await this.addMemberToSubproject(
      projectId,
      userId,
      subProjectRole,
    );
    return {
      newMember,
      subproject,
    };
  }

  private async addMemberToSubproject(
    projectId: number,
    memberId: number,
    role: SubprojectRole,
  ) {
    const subprojects = await this.prisma.subProject.findMany({
      where: { projectId: projectId },
    });
    console.log(subprojects);

    const recentActivites = subprojects.map((subproject) => ({
      recentActivitiesId: subproject.recentActivitesId,
      name: subproject.name,
    }));

    let re = await this.prisma.subprojectMember.createMany({
      data: subprojects.map((e) => {
        return {
          role: role,
          subprojectId: e.id,
          userId: memberId,
        };
      }),
    });

    console.log(re);

    for (const iterator of recentActivites) {
      await this.prisma.recentActivites.update({
        where: { id: iterator.recentActivitiesId },
        data: {
          description: `Member [${memberId}] has been added to SubProject [${iterator.name}]`,
        },
      });
    }
    return subprojects;
  }

  async getProjectDetailById(projectId: number, userId: number) {
    let project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        members: {
          some: {
            memberId: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            memberId: true,
            role: true,
            member: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        projectPicture: true,
        attachments: true,
        reports: true,
        subProjects: true,
      },
    });
    if (project === null) {
      throw new ApiException(404, 'not_found');
    }
    let result = {
      id: project.id,
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      projectPicture: null,
      members: [],
      attachments: [],
      reports: [],
      subProjects: [],
    };
    if (project.projectPicture) {
      let pict = await this.upload.getFileUrl(
        project.projectPicture.imagePath,
        project.projectPicture.contentType,
      );
      result.projectPicture = pict;
    }
    for (const member of project.members) {
      let profilePict = null;
      if (member.member.profilePicture) {
        let image = await this.upload.getFileUrl(
          member.member.profilePicture.imagePath,
          member.member.profilePicture.contentType,
        );
        profilePict = image;
      }
      result.members.push({
        userId: member.member.id,
        memberId: member.id,
        role: member.role,
        name: member.member.name,
        profilePicture: profilePict,
      });
    }
    for (const attachment of project.attachments) {
      let file = await this.upload.getFileUrl(
        attachment.imagePath,
        attachment.contentType,
      );
      result.attachments.push({
        id: attachment.id,
        name: attachment.name,
        file: file,
      });
    }
    for (const report of project.reports) {
      let file = await this.upload.getFileUrl(
        report.imagePath,
        report.contentType,
      );
      result.reports.push({
        id: report.id,
        name: report.name,
        file: file,
      });
    }
    for (const subProject of project.subProjects) {
      let subProjectResult = {
        id: subProject.id,
        name: subProject.name,
        startDate: subProject.startDate,
        endDate: subProject.endDate,
      };

      result.subProjects.push(subProjectResult);
    }
    return result;
  }
  async getProjectDetail(projectId: number) {
    let project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {
          select: {
            id: true,
            memberId: true,
            role: true,
            member: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        projectPicture: true,
        attachments: true,
        reports: true,
        subProjects: true,
      },
    });
    if (project === null) {
      throw new ApiException(404, 'not_found');
    }
    let result = {
      id: project.id,
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      projectPicture: null,
      members: [],
      attachments: [],
      reports: [],
      subProjects: [],
    };
    if (project.projectPicture) {
      let pict = await this.upload.getFileUrl(
        project.projectPicture.imagePath,
        project.projectPicture.contentType,
      );
      result.projectPicture = pict;
    }
    for (const member of project.members) {
      let profilePict = null;
      if (member.member.profilePicture) {
        let image = await this.upload.getFileUrl(
          member.member.profilePicture.imagePath,
          member.member.profilePicture.contentType,
        );
        profilePict = image;
      }
      result.members.push({
        userId: member.member.id,
        memberId: member.id,
        role: member.role,
        name: member.member.name,
        profilePicture: profilePict,
      });
    }
    for (const attachment of project.attachments) {
      let file = await this.upload.getFileUrl(
        attachment.imagePath,
        attachment.contentType,
      );
      result.attachments.push({
        id: attachment.id,
        name: attachment.name,
        file: file,
      });
    }
    for (const report of project.reports) {
      let file = await this.upload.getFileUrl(
        report.imagePath,
        report.contentType,
      );
      result.reports.push({
        id: report.id,
        name: report.name,
        file: file,
      });
    }
    for (const subProject of project.subProjects) {
      let subProjectResult = {
        id: subProject.id,
        name: subProject.name,
        startDate: subProject.startDate,
        endDate: subProject.endDate,
      };

      result.subProjects.push(subProjectResult);
    }
    return result;
  }
}
