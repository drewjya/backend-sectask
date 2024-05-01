import { HttpStatus, Injectable } from '@nestjs/common';
import { BlockType, File, Prisma } from '@prisma/client';
import { FileUploadService } from 'src/module/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { BlockContentType, FetchOldBlock } from './dto/actionDescription.dto';
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
      file: true,
    },
  };

  //Controller
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
        findingDate: new Date(),

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
      this.prisma.recentActivities.update({
        data: {
          title: 'Finding Created',
          description: `Finding created in subproject ${subprojectFind.name}`,
        },
        where: {
          id: subprojectFind.recentActivitiesId,
        },
      }),
      this.prisma.recentActivities.update({
        data: {
          title: 'Finding Created',
          description: `Finding created in project ${project.name}`,
        },
        where: {
          id: project.recentActivitiesId,
        },
      }),
    ]);

    return finding;
  }
  //Controller
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
        businessImpact: this.INFO,
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

    let data = {
      id: finding.id,
      name: finding.name,
      risk: finding.risk,
      location: finding.location,
      method: finding.method,
      environment: finding.environment,
      application: finding.application,
      impact: finding.impact,
      likelihood: finding.likelihood,
      findingDate: finding.findingDate,
      subProjectId: finding.subProjectId,
      recentActivitiesId: finding.recentActivitiesId,
      subProject: finding.subProject,
      recentActivities: finding.recentActivities,
      description: [],
      businessImpact: [],
      recomendation: [],
      retestResult: [],
      threatAndRisk: [],
    };
    data.description = await this.dataConverter(finding.description);
    data.businessImpact = await this.dataConverter(finding.businessImpact);
    data.recomendation = await this.dataConverter(finding.recomendation);
    data.retestResult = await this.dataConverter(finding.retestResult);
    data.threatAndRisk = await this.dataConverter(finding.threatAndRisk);

    return data;
  }

  //Controller
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

  async createContent(param: {
    findingId: number;
    userId: number;
    blockType: BlockType;
    content: string;
    contentType: BlockContentType;
    previousBlockId?: string;
  }) {
    const {
      findingId,
      userId,
      blockType,
      contentType,
      previousBlockId,
      content,
    } = param;
    await this.findFindingById({ findingId, userId: userId });

    const oldBlock = await this.getOldBlock({
      contentType: contentType,
      previousBlockId: previousBlockId,
      findingId: findingId,
    });

    const createdBlock = await this.createBlock({
      previousBlockId: oldBlock?.id,
      content: content,
      contentType: contentType,
      blockType: blockType,
      findingId: findingId,
    });
    if (oldBlock && oldBlock.nextBlock) {
      await this.prisma.block.update({
        where: {
          id: oldBlock.nextBlock.id,
        },
        data: {
          previousBlock: {
            connect: {
              id: createdBlock.id,
            },
          },
        },
      });
    }
    return createdBlock;
  }
  //CONTROLLER
  async deleteContent(params: {
    userId: number;
    findingId: number;
    blockId: string;
    contentType: BlockContentType;
  }) {
    const { userId, findingId, blockId, contentType } = params;
    await this.findFindingById({ findingId: findingId, userId: userId });
    const deletedBlock = await this.findBlockByIdAndContentType({
      blockId: blockId,
      contentType: contentType,
      findingId: findingId,
    });
    if (!deletedBlock) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'Block not found.');
    }
    if (deletedBlock.file) {
      await this.fileUpload.deleteFile(deletedBlock.file.imagePath);
      await this.prisma.file.delete({
        where: {
          id: deletedBlock.file.id,
        },
      });
    }
    await this.prisma.block.delete({
      where: { id: deletedBlock.id },
    });

    if (deletedBlock.previousBlock && deletedBlock.nextBlock) {
      await this.prisma.block.update({
        where: { id: deletedBlock.nextBlock.id },
        data: { previousBlockId: deletedBlock.previousBlock.id },
      });
    } else if (!deletedBlock.previousBlock && deletedBlock.nextBlock) {
      // If the deleted block was the first in the chain
      await this.prisma.block.update({
        where: { id: deletedBlock.nextBlock.id },
        data: { previousBlockId: null },
      });
    }
    // No action needed if the deleted block was the last in the chain or standalone

    return { message: 'Description deleted successfully.' };
  }

  //CONTROLLER
  async editContent(params: {
    blockId: string;
    content: string;
    userId: number;
    blockType: BlockType;
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
      blockType,
    } = params;
    await this.findFindingById({ findingId, userId });

    const currentBlock = await this.findBlockByIdAndContentType({
      blockId: blockId,
      contentType: contentType,
      findingId: findingId,
    });

    if (!currentBlock) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'block_not_found');
    }

    if (currentBlock.type !== blockType && currentBlock.file) {
      await this.fileUpload.deleteFile(currentBlock.file.imagePath);
      await this.prisma.file.delete({
        where: {
          id: currentBlock.file.id,
        },
      });
    }
    if (content) {
      await this.prisma.block.update({
        where: { id: blockId },
        data: {
          content: content,
          type: blockType,
        },
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

  async uploadFileBlock(params: {
    userId: number;
    blockId: string;
    findingId: number;
    file: Express.Multer.File;
  }) {
    const { userId, blockId, file, findingId } = params;
    await this.findFindingById({
      findingId,
      userId,
    });

    const created = await this.fileUpload.uploadFile(file);
    await this.prisma.block.update({
      where: {
        id: blockId,
      },
      data: {
        file: {
          connect: {
            id: created.id,
          },
        },
      },
    });

    return {
      message: 'Success Upload File',
    };
  }
  // Library Internal

  private async dataConverter(
    data: {
      id: string;
      content: string;
      type: string;
      fileId: number;
      isChecked: boolean;
      previousBlockId?: string;
      createdAt: Date;
      updatedAt: Date;
      nextBlock?: { id: string };
      file?: File;
    }[],
  ) {
    let descr: {
      id: string;
      content: string;
      type: string;
      fileId: number;
      isChecked: boolean;
      previousBlockId?: string;
      createdAt: Date;
      updatedAt: Date;
      nextBlock?: { id: string };
      file?: string;
    }[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.file) {
        const url = await this.fileUpload.getFileUrl(
          element.file.imagePath,
          element.file.contentType,
        );
        descr = [
          ...descr,
          {
            id: element.id,
            content: element.content,
            type: element.type,
            fileId: element.fileId,
            isChecked: element.isChecked,
            previousBlockId: element.previousBlockId,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt,
            nextBlock: element.nextBlock,
            file: url,
          },
        ];
      } else {
        descr = [
          ...descr,
          {
            id: element.id,
            content: element.content,
            type: element.type,
            fileId: element.fileId,
            isChecked: element.isChecked,
            previousBlockId: element.previousBlockId,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt,
            nextBlock: element.nextBlock,
            file: null,
          },
        ];
      }
    }
    return descr;
  }

  private async findFindingById(params: { findingId: number; userId: number }) {
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
  private async findBlockByIdAndContentType(params: {
    blockId: string;
    contentType: BlockContentType;
    findingId: number;
  }) {
    const { blockId, contentType, findingId } = params;
    let where: Prisma.BlockWhereUniqueInput = {
      id: blockId,
    };
    const condition = {
      some: {
        id: findingId,
      },
    };

    switch (contentType) {
      case BlockContentType.DESCRIPTION:
        where.AND = {
          findingDescriptions: condition,
        };
        break;

      case BlockContentType.IMPACT:
        where.AND = {
          findingBusinessImpact: condition,
        };
        break;
      case BlockContentType.RECOMMENDATION:
        where.AND = {
          findingRecomendation: condition,
        };
        break;
      case BlockContentType.RETEST:
        where.AND = {
          findingRetestResult: condition,
        };
        break;
      case BlockContentType.THREAT:
        where.AND = {
          findingThreatAndRisk: condition,
        };
        break;
    }

    const deletedBlock = await this.prisma.block.findFirst({
      where: where,
      include: {
        previousBlock: true,
        file: true,
        nextBlock: true, // Assuming you manage to infer nextBlock through some logic or structure
      },
    });
    return deletedBlock;
  }

  private async createBlock(params: {
    previousBlockId?: string;
    content: string;
    blockType: BlockType;
    contentType: BlockContentType;
    findingId: number;
  }) {
    const { previousBlockId, content, contentType, findingId, blockType } =
      params;
    let data: Prisma.BlockCreateInput = {};
    let connect = {
      connect: { id: findingId },
    };

    if (previousBlockId) {
      data.previousBlock = {
        connect: { id: previousBlockId },
      };
    }

    switch (contentType) {
      case BlockContentType.DESCRIPTION:
        data.findingDescriptions = connect;
        break;

      case BlockContentType.THREAT:
        data.findingThreatAndRisk = connect;
        break;

      case BlockContentType.IMPACT:
        data.findingBusinessImpact = connect;
        break;

      case BlockContentType.RECOMMENDATION:
        data.findingRecomendation = connect;
        break;

      case BlockContentType.RETEST:
        data.findingRetestResult = connect;
        break;
    }

    // Create the new description block
    const blockCreated = await this.prisma.block.create({
      data: {
        content: content,
        type: blockType,
        ...data,
      },
    });
    return blockCreated;
  }

  private async getOldBlock(params: {
    contentType: BlockContentType;
    previousBlockId?: string;
    findingId: number;
  }) {
    const { contentType, previousBlockId, findingId } = params;
    const condition = {
      some: {
        id: findingId,
      },
    };
    let oldBlock: FetchOldBlock;
    switch (contentType) {
      case BlockContentType.DESCRIPTION:
        if (previousBlockId) {
          oldBlock = await this.prisma.block.findUnique({
            where: {
              id: previousBlockId,
              AND: {
                findingDescriptions: condition,
              },
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
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
              findingDescriptions: condition,
              previousBlockId: null,
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
            },
          });
        }
        break;
      case BlockContentType.IMPACT:
        if (previousBlockId) {
          oldBlock = await this.prisma.block.findUnique({
            where: {
              id: previousBlockId,
              AND: {
                findingBusinessImpact: condition,
              },
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
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
              findingBusinessImpact: condition,
              previousBlockId: null,
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
            },
          });
        }
        break;
      case BlockContentType.RECOMMENDATION:
        if (previousBlockId) {
          oldBlock = await this.prisma.block.findUnique({
            where: {
              id: previousBlockId,
              AND: {
                findingRecomendation: condition,
              },
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
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
              findingRecomendation: condition,
              previousBlockId: null,
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
            },
          });
        }
        break;
      case BlockContentType.RETEST:
        if (previousBlockId) {
          oldBlock = await this.prisma.block.findUnique({
            where: {
              id: previousBlockId,
              AND: {
                findingRetestResult: condition,
              },
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
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
              findingRetestResult: condition,
              previousBlockId: null,
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
            },
          });
        }
        break;
      case BlockContentType.THREAT:
        if (previousBlockId) {
          oldBlock = await this.prisma.block.findUnique({
            where: {
              id: previousBlockId,
              AND: {
                findingThreatAndRisk: condition,
              },
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
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
              findingThreatAndRisk: condition,
              previousBlockId: null,
            },
            include: {
              nextBlock: {
                select: {
                  id: true,
                },
              },
            },
          });
        }
        break;
    }
    return oldBlock;
  }
}
