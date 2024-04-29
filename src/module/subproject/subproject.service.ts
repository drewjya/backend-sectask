import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole, SubprojectRole } from '@prisma/client';
import { FileUploadService } from 'src/module/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { AddSubMemberDto } from './dto/addSubMemberDto';
import { CreateSubProjectDto } from './dto/createSubProject.dto';

@Injectable()
export class SubprojectService {
  constructor(
    private readonly prisma: PrismaService,
    private upload: FileUploadService,
  ) {}

  async createSubProject(
    userId: number,
    createSubprojectDto: CreateSubProjectDto,
  ) {
    let project = await this.prisma.project.findUnique({
      where: {
        id: createSubprojectDto.projectId,
        members: {
          some: {
            memberId: userId,
            role: {
              equals: 'OWNER',
            },
          },
        },
      },
    });

    console.log(userId, 'USER ID');

    if (!project) {
      console.log(project, 'FORBIDDEN');

      throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden');
    }
    let projectMembers = await this.prisma.projectMember.findMany({
      where: {
        projectId: createSubprojectDto.projectId,
      },
      select: {
        memberId: true,
        role: true,
      },
    });

    console.log(projectMembers);

    let members = [];
    for (const iterator of projectMembers) {
      let role: SubprojectRole;
      if (iterator.role === ProjectRole.OWNER) {
        role = SubprojectRole.PM;
      } else if (iterator.role === ProjectRole.DEVELOPER) {
        role = SubprojectRole.DEVELOPER;
      } else if (iterator.role === ProjectRole.TECHNICAL_WRITER) {
        role = SubprojectRole.TECHNICAL_WRITER;
      } else {
        role = SubprojectRole.GUEST;
      }
      members.push({
        role: role,
        userId: iterator.memberId,
      });
    }
    let subproject = await this.prisma.subProject.create({
      data: {
        name: createSubprojectDto.name,
        endDate: createSubprojectDto.endDate,
        startDate: createSubprojectDto.startDate,
        project: {
          connect: {
            id: createSubprojectDto.projectId,
          },
        },
        members: {
          create: members,
        },
        reports: {},
        recentActivities: {
          create: {
            title: `SubProject [${createSubprojectDto.name}] Created`,
            description: `SubProject [${createSubprojectDto.name}] has been created by [${userId}]`,
          },
        },
      },
    });

    await this.prisma.recentActivities.update({
      data: {
        title: `SubProject [${createSubprojectDto.name}] Created`,
        description: `SubProject [${createSubprojectDto.name}] has been created by [${userId}]`,
      },
      where: {
        id: subproject.recentActivitiesId,
      },
    });

    return {
      name: subproject.name,
      id: subproject.id,
    };
  }

  async searchMember(email: string, subprojectId: number) {
    {
      let project = await this.prisma.subProject.findUnique({
        where: {
          id: subprojectId,
        },
        include: {
          project: true,
        },
      });
      if (!project) {
        throw new ApiException(404, 'subproject_not_found');
      }
      let users = await this.prisma.user.findMany({
        where: {
          subProjects: {
            none: {
              subprojectId: subprojectId,
            },
          },
          AND: {
            projects: {
              some: {
                projectId: project.id,
              },
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
  }

  async addMember(
    subProjectId: number,
    ownerId: number,
    member: AddSubMemberDto,
  ) {
    let subProject = await this.prisma.subProject.findFirst({
      where: {
        id: subProjectId, // Replace 1 with the actual subproject ID you want to search for
        members: {
          some: {
            userId: ownerId,
            role: 'PM',
          },
        },
      },
      include: {
        members: true,
        recentActivities: true,
        project: true,
      },
    });

    if (!subProject) {
      throw new ApiException(404, 'unauthorized');
    }
    let isMember = subProject.members.some(
      (val) => val.userId === member.userId,
    );

    let user = await this.prisma.user.findUnique({
      where: {
        id: member.userId,
      },
    });

    if (!user) {
      throw new ApiException(400, 'user_not_found');
    }

    let a = await this.prisma.subProject.update({
      data: {
        members: {
          update: {
            where: {
              subprojectId_userId: {
                subprojectId: subProjectId,
                userId: member.userId,
              },
            },
            data: {
              role: member.role,
              userId: member.userId,
            },
          },
        },
        recentActivities: {
          update: {
            data: {
              title: `Member [${user.name}] Added to SubProject [${subProject.name}]`,
              description: `Member [${user.name}] has been added to SubProject [${subProject.name}]`,
            },
            where: {
              id: subProject.recentActivities.id,
            },
          },
        },
      },
      where: {
        id: subProjectId,
      },
    });

    await this.prisma.recentActivities.update({
      data: {
        title: `Project ${subProject.project.name} Updated`,
        description: `Member [${user.name}] has been added to SubProject [${subProject.name}]`,
      },
      where: {
        id: subProject.project.recentActivitiesId,
      },
    });
    return a;
  }

  async getSubprojectDetail(params: { subProjectId: number; userId: number }) {
    let subProject = await this.prisma.subProject.findFirst({
      where: {
        id: params.subProjectId,
        members: {
          some: {
            userId: params.userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        findings: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            projectPicture: true,
            id: true,
          },
        },
        reports: true,
        attachments: true,
      },
    });

    if (!subProject) {
      throw new ApiException(404, 'subproject_not_found');
    }
    let result = {
      id: subProject.id,
      name: subProject.name,
      startDate: subProject.startDate,
      endDate: subProject.endDate,
      findings: subProject.findings,
      members: [],
      attachments: [],
      reports: [],
      projectPicture: null,
    };

    if (subProject.project.projectPicture) {
      let pict = await this.upload.getFileUrl(
        subProject.project.projectPicture.imagePath,
        subProject.project.projectPicture.contentType,
      );
      result.projectPicture = pict;
    }

    for (const member of subProject.members) {
      let profilePict = null;
      if (member.user.profilePicture) {
        profilePict = await this.upload.getFileUrl(
          member.user.profilePicture.imagePath,
          member.user.profilePicture.contentType,
        );
      }
      result.members.push({
        userId: member.user.id,
        memberId: member.id,
        role: member.role,
        name: member.user.name,
        profilePicture: profilePict,
      });
    }
    for (const attachment of subProject.attachments) {
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
    for (const report of subProject.reports) {
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

    return result;
  }
  async getSubprojectDetailId(subProjectId: number) {
    let subProject = await this.prisma.subProject.findFirst({
      where: {
        id: subProjectId,
      },
      include: {
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        findings: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            projectPicture: true,
            id: true,
          },
        },
        reports: true,
        attachments: true,
      },
    });

    if (!subProject) {
      throw new ApiException(404, 'subproject_not_found');
    }
    let result = {
      id: subProject.id,
      name: subProject.name,
      startDate: subProject.startDate,
      endDate: subProject.endDate,
      findings: subProject.findings,
      members: [],
      attachments: [],
      reports: [],
      projectPicture: null,
    };

    if (subProject.project.projectPicture) {
      let pict = await this.upload.getFileUrl(
        subProject.project.projectPicture.imagePath,
        subProject.project.projectPicture.contentType,
      );
      result.projectPicture = pict;
    }

    for (const member of subProject.members) {
      let profilePict = null;
      if (member.user.profilePicture) {
        profilePict = await this.upload.getFileUrl(
          member.user.profilePicture.imagePath,
          member.user.profilePicture.contentType,
        );
      }
      result.members.push({
        userId: member.user.id,
        memberId: member.id,
        role: member.role,
        name: member.user.name,
        profilePicture: profilePict,
      });
    }
    for (const attachment of subProject.attachments) {
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
    for (const report of subProject.reports) {
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

    return result;
  }
}
