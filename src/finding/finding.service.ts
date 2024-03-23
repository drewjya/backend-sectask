import { HttpStatus, Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import {
  BlockContentType,
  conditionDelete,
  getDataAdd,
  getIncludeAndConditionAdd,
} from './dto/actionDescription.dto';
import { NewFindingDto } from './dto/newFinding.dto';

@Injectable()
export class FindingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUpload: FileUploadService,
  ) {}
  INFO = {
    include: {
      nextBlock: {
        select: {
          id: true,
        },
      },
    },
  };

  async findFindingById(params: { findingId: number; userId: number }) {
    const { findingId, userId } = params;
    const finding = await this.prisma.finding.findUnique({
      where: {
        id: findingId,
        subProject: {
          members: {
            some: {
              userId: userId,
              role: 'CONSULTANT',
            },
          },
        },
      },
    });

    if (!finding) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'Forbidden');
    }
  }

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
        description: this.INFO,
        impact: this.INFO,
        recentActivities: true,
        recomendation: this.INFO,
        retestResult: this.INFO,
        subProject: {
          select: {
            id: true,
            projectId: true,
          },
        },
        threatAndRisk: this.INFO,
      },
    });
    return finding;
  }

  async editFinding(params: {
    memberId: number;
    finding: number;
    risk?: string;
    name?: string;
  }) {
    const { finding, memberId, name, risk } = params;
    if (name || risk) {
      let field = {};
      if (name) {
        field['name'] = name;
      }
      if (risk) {
        field['risk'] = risk;
      }
      console.log(field);

      await this.findFindingById({ findingId: finding, userId: memberId });
      const updatedFinding = await this.prisma.finding.update({
        where: {
          id: finding,
          subProject: {
            members: {
              some: {
                userId: memberId,
                role: 'CONSULTANT',
              },
            },
          },
        },
        data: field,
      });
      return updatedFinding;
    }
  }

  async insertContent(params: {
    findingId: number;
    memberId: number;
    content: string;
    contentType: BlockContentType;
    previousBlockId?: string;
  }) {
    const { findingId, memberId, content, previousBlockId, contentType } =
      params;
    await this.findFindingById({ findingId, userId: memberId });
    let oldBlock: {
      nextBlock: {
        id: string;
        content: string;
        previousBlockId: string;
        createdAt: Date;
        updatedAt: Date;
      };
    } & {
      id: string;
      content: string;
      previousBlockId: string;
      createdAt: Date;
      updatedAt: Date;
    } = null;

    let { condition, include } = getIncludeAndConditionAdd({
      contentType: contentType,
      findingId: findingId,
    });

    if (previousBlockId) {
      condition.id = previousBlockId;
      oldBlock = await this.prisma.block.findUnique({
        where: condition,
        include: include,
      });

      if (!oldBlock) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'Invalid previousBlockId',
        );
      }
    } else {
      let newCond = {
        previousBlockId: null,
        ...condition,
      };

      oldBlock = await this.prisma.block.findFirst({
        where: newCond,
        include: include,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let data: any = getDataAdd({
      blockId: oldBlock?.id,
      content: content,
      contentType: contentType,
      findingId: findingId,
    });
    // Create the new description block
    const description = await this.prisma.block.create({
      data: data,
    });

    if (oldBlock && oldBlock.nextBlock) {
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

  async deleteDescription(params: {
    blockId: string;
    findingId: number;
    memberId: number;
    contentType: BlockContentType;
  }) {
    const { blockId, findingId, memberId, contentType } = params;
    await this.findFindingById({ findingId, userId: memberId });
    let condition = conditionDelete({
      contentType: contentType,
      findingId: findingId,
    });

    const blockToDelete = await this.prisma.block.findFirst({
      where: {
        id: blockId,
        AND: condition,
      },
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

  async updateDescription(params: {
    blockId: string;
    content: string;
    userId: number;
    newPreviousBlockId?: string;
    findingId: number;
    contentType: BlockContentType;
  }) {
    const {
      blockId,
      content,
      newPreviousBlockId,
      findingId,
      contentType,
      userId,
    } = params;
    await this.findFindingById({ findingId, userId });
    let condition = conditionDelete({
      contentType: contentType,
      findingId: findingId,
    });

    const currentBlock = await this.prisma.block.findUnique({
      where: { id: blockId, AND: condition },
      include: {
        previousBlock: true,
        nextBlock: true, // You might need custom logic to identify the next block
      },
    });

    if (!currentBlock) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'Block not found.');
    }

    if (content) {
      await this.prisma.block.update({
        where: { id: blockId },
        data: { content: content },
      });
    }

    if (
      newPreviousBlockId !== undefined &&
      currentBlock.previousBlockId !== newPreviousBlockId
    ) {
      // Detach the block from its current position by linking its next and previous blocks
      if (currentBlock.previousBlock) {
        await this.prisma.block.update({
          where: { id: currentBlock.previousBlock.id },
          data: {
            nextBlock: currentBlock.nextBlock
              ? { connect: { id: currentBlock.nextBlock.id } }
              : { disconnect: true },
          },
        });
      }
      if (currentBlock.nextBlock) {
        await this.prisma.block.update({
          where: { id: currentBlock.nextBlock.id },
          data: {
            previousBlockId: currentBlock.previousBlock
              ? currentBlock.previousBlock.id
              : null,
          },
        });
      }

      // Attach the block to the new position
      // Update the new previous block's next to point to the current block
      if (newPreviousBlockId) {
        await this.prisma.block.update({
          where: { id: newPreviousBlockId },
          data: { nextBlock: { connect: { id: blockId } } },
        });
      }
      // Update the current block's previous to the newPreviousBlockId
      await this.prisma.block.update({
        where: { id: blockId },
        data: { previousBlockId: newPreviousBlockId },
      });

      // If there is a block that was originally next to the new previous block, update its previous to the current block
      // This step may require you to find and update the block that was the next of newPreviousBlock before the update, which is not shown here for brevity.
    }

    return { message: 'Block updated successfully.' };
  }
}
