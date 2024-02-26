import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utls/exception/api.exception';
import { AddSubMemberDto } from './dto/addSubMemberDto';
import { CreateSubProjectDto } from './dto/createSubProject.dto';

@Injectable()
export class SubprojectService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubProject(
    userId: number,
    createSubprojectDto: CreateSubProjectDto,
  ) {
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
          create: [{ role: 'PM', userId: userId }],
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
    console.log(ownerId);

    let subProject = await this.prisma.subProject.findFirst({
      where: {
        id: subProjectId, // Replace 1 with the actual subproject ID you want to search for
        members: {
          some: {
            userId: 1,
            role: 'PM',
          },
        },
      },
      include: {
        members: true,
        recentActivities: true,
      },
    });

    if (!subProject) {
      throw new ApiException(404, 'unauthorized');
    }
    let isMember = subProject.members.some(
      (val) => val.userId === member.userId,
    );
    if (isMember) {
      throw new ApiException(400, 'already_member');
    }
    let user = await this.prisma.user.findUnique({
      where: {
        id: member.userId,
      },
    });

    if (!user) {
      throw new ApiException(400, 'user_not_found');
    }

    return this.prisma.subProject.update({
      data: {
        members: {
          create: {
            role: member.role,
            userId: member.userId,
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
  }
}
