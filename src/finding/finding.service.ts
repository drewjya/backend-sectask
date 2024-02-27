import { HttpStatus, Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utls/exception/api.exception';
import { NewFindingDto } from './dto/newFinding.dto';

@Injectable()
export class FindingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUpload: FileUploadService,
  ) {}

  async create(memberId: number, newFindingDto: NewFindingDto) {
    const subprojectFind = await this.prisma.subProject.findUnique({
      where: {
        id: newFindingDto.subprojectId,
        members: {
          some: {
            id: memberId,
            role: {
              equals: 'CONSULTANT',
            },
          },
        },
      },
    });
    if (!subprojectFind) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden');
    }
    const finding = await this.prisma.finding.create({
      data: {
        subProject: {
          connect: {
            id: newFindingDto.subprojectId,
          },
        },
        name: 'Untitled',
        risk: '',
        recentActivities: {
          create: {
            title: 'New Finding Created',
            description: `${memberId} created a new finding in subproject ${subprojectFind.name}`,
          },
        },
      },
    });

    const project = await this.prisma.project.findFirst({
      where: {
        subProjects: {
          some: {
            id: newFindingDto.subprojectId,
          },
        },
      },
    });

    await Promise.all([
      this.prisma.recentActivites.update({
        data: {
          title: 'Finding Created',
          description: `Finding created in subproject ${subprojectFind.name}`,
        },
        where: {
          id: subprojectFind.recentActivitesId,
        },
      }),
      this.prisma.recentActivites.update({
        data: {
          title: 'Finding Created',
          description: `Finding created in project ${project.name}`,
        },
        where: {
          id: project.recentActivitesId,
        },
      }),
    ]);

    return finding;
  }
}
