import { HttpStatus, Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
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
            userId: memberId,
            role: {
              equals: 'CONSULTANT',
            },
          },
        },
      },
    });
    console.log(newFindingDto.subprojectId, memberId);

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

  async getFindingDetail(memberId: number, findingId: number) {
    const finding = await this.prisma.finding.findUnique({
      where: {
        id: findingId,
        AND: {
          subProject: {
            members: {
              some: {
                userId: memberId,
              },
            },
          },
        },
      },
      include: {
        description: {
          include: {
            nextBlock: {
              select: {
                id: true,
              },
            },
          },
        },
        impact: {
          include: {
            nextBlock: {
              select: {
                id: true,
              },
            },
          },
        },
        recentActivities: true,
        recomendation: {
          include: {
            nextBlock: {
              select: {
                id: true,
              },
            },
          },
        },
        retestResult: {
          include: {
            nextBlock: {
              select: {
                id: true,
              },
            },
          },
        },
        subProject: {
          select: {
            id: true,
            projectId: true,
          },
        },
        threatAndRisk: {
          include: {
            nextBlock: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    return finding;
  }

  async insertDescription(
    findingId: number,
    memberId: number,
    content: string,
    previousBlockId?: string,
  ) {
    const finding = await this.prisma.finding.findUnique({
      where: {
        id: findingId,
      },
      include: {
        subProject: {
          include: {
            members: true,
          },
        },
      },
    });

    if (
      !finding ||
      !finding.subProject.members.some(
        (member) => member.userId === memberId && member.role === 'CONSULTANT',
      )
    ) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'Forbidden');
    }
    let oldBlock: {
      nextBlock: {
        id: string;
        content: string;
        previousBlockId: string;
        createdAt: Date;
        updatedAt: Date;
      };

      findingDescriptions: {
        id: number;
        name: string;
        risk: string;
        subProjectId: number;
        recentActivitesId: number;
      }[];
    } & {
      id: string;
      content: string;
      previousBlockId: string;
      createdAt: Date;
      updatedAt: Date;
    } = null;
    if (previousBlockId) {
      oldBlock = await this.prisma.block.findUnique({
        where: {
          id: previousBlockId,
          AND: {
            findingDescriptions: {
              some: {
                id: findingId,
              },
            },
          },
        },
        include: {
          findingDescriptions: true,
          nextBlock: true,
        },
      });

      if (!oldBlock) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'Invalid previousBlockId',
        );
      }
    } else {
      oldBlock = await this.prisma.block.findFirst({
        where: {
          findingDescriptions: {
            some: {
              id: findingId,
            },
          },
          AND: {
            previousBlockId: null,
          },
        },
        include: {
          findingDescriptions: true,
          nextBlock: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    console.log(oldBlock);

    // Create the new description block
    const description = await this.prisma.block.create({
      data: {
        content: content,
        findingDescriptions: {
          connect: { id: findingId },
        },
        previousBlock: {
          connect: {
            id: oldBlock.id,
          },
        },
      },
    });

    if (oldBlock.nextBlock) {
      await this.prisma.block.update({
        where: {
          id: oldBlock.nextBlock.id,
        },
        data: {
          previousBlock: {
            connect: {
              id: description.id,
            },
          },
        },
      });
    }
    return description;
  }

  async deleteDescription(
    blockId: string,
    findingId: number,
    memberId: number,
  ) {
    const permission = await this.prisma.finding.findFirst({
      where: {
        id: findingId,
        subProject: {
          members: {
            some: {
              userId: memberId,
              role: 'CONSULTANT',
            },
          },
        },
      },
      include: {},
    });

    if (!permission) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'Forbidden: You do not have permission to perform this action.',
      );
    }

    const blockToDelete = await this.prisma.block.findFirst({
      where: { id: blockId },
      include: {
        previousBlock: true,
        nextBlock: true, // Assuming you manage to infer nextBlock through some logic or structure
      },
    });

    console.log(blockToDelete);

    if (!blockToDelete) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'Block not found.');
    }
    await this.prisma.block.delete({
      where: { id: blockToDelete.id },
    });

    if (blockToDelete.previousBlock && blockToDelete.nextBlock) {
      await this.prisma.block.update({
        where: { id: blockToDelete.nextBlock.id },
        data: { previousBlockId: blockToDelete.previousBlock.id },
      });
    } else if (!blockToDelete.previousBlock && blockToDelete.nextBlock) {
      // If the deleted block was the first in the chain
      await this.prisma.block.update({
        where: { id: blockToDelete.nextBlock.id },
        data: { previousBlockId: null },
      });
    }
    // No action needed if the deleted block was the last in the chain or standalone

    return { message: 'Description deleted successfully.' };
  }
}
