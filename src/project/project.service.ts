import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return recentUpdates;
    } catch (error) {
      throw error;
    }
  }
  findAll() {
    return `This action returns all project`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
