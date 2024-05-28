import { Injectable } from '@nestjs/common';
import { SubprojectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { uuid } from 'src/common/uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { unauthorized } from 'src/utils/exception/common.exception';
import { UpdateFindingDto } from './dto/update-finding.dto';

@Injectable()
export class FindingService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
  }

  async create(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      role: [SubprojectRole.CONSULTANT],
      subproject: param.subprojectId,
      userId: param.userId,
    });
    return this.prisma.finding.create({
      data: {
        name: 'Untitled Finding',
        subProject: {
          connect: {
            id: param.subprojectId,
          },
        },
        createdBy: {
          connect: {
            id: param.userId,
          },
        },
        chatRoom: {
          create: {},
        },
        cvssDetail: {
          create: {},
        },
        testerFinding: {
          create: {
            user: {
              connect: {
                id: param.userId,
              },
            },
          },
        },
        description: {
          create: {
            id: uuid(),
            data: Buffer.from(''),
          },
        },
        threatAndRisk: {
          create: {
            id: uuid(),
            data: Buffer.from(''),
          },
        },
      },
    });
  }

  async notifyEdit(param: { userId: number; findingId: number }) {
    const subproject = await this.prisma.finding.findUnique({
      where: {
        id: param.findingId,
        AND: {
          subProject: {
            members: {
              some: {
                userId: param.userId,
                role: SubprojectRole.CONSULTANT,
              },
            },
          },
        },
      },
    });
    if (!subproject) {
      throw unauthorized;
    }
    return this.prisma.testerFinding.upsert({
      where: {
        userId_findingId: {
          findingId: param.findingId,
          userId: param.userId,
        },
      },
      update: {
        active: true,
      },
      create: {
        user: {
          connect: {
            id: param.userId,
          },
        },
        finding: {
          connect: {
            id: param.findingId,
          },
        },
        active: true,
      },
    });
  }

  async findDetail(param: { userId: number; findingId: number }) {
    const finding = await this.prisma.finding.findUnique({
      where: {
        id: param.findingId,
        AND: {
          subProject: {
            project: {
              members: {
                some: {
                  userId: param.userId,
                },
              },
            },
          },
        },
      },
      include: {
        cvssDetail: true,
        testerFinding: {
          where: {
            userId: param.userId,
          },
          include: {
            user: true,
          },
        },
        chatRoom: true,
      },
    });
    if (!finding) {
      throw unauthorized;
    }
    return finding;
  }

  async editFindingProperties(param: {
    properties: {
      category: string;
      location: string;
      method: string;
      environment: string;
      application: string;
      impact: string;
      likelihood: string;
    };
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    await this.authorizedEditor({
      roles: [SubprojectRole.CONSULTANT],
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let newFInding = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      data: {
        category: param.properties.category,
        location: param.properties.location,
        method: param.properties.method,
        environment: param.properties.environment,
        application: param.properties.application,
        impact: param.properties.impact,
        likelihood: param.properties.likelihood,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
    return newFInding;
  }

  async editRetestProperties(param: {
    properties: {
      latestUpdate: Date;
      tester: string;
      status: string;
      releases: string;
    };
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    await this.authorizedEditor({
      roles: [SubprojectRole.CONSULTANT],
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let newFInding = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      data: {
        latestUpdate: param.properties.latestUpdate,
        //TODO: tester: param.properties.tester,
        status: param.properties.status,
        releases: param.properties.releases,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
    return newFInding;
  }

  editCVSS(param: { cvss: number; userId: number; findingId: number }) {}

  async deleteFinding(param: {
    userId: number;
    findingId: number;
    subprojectId: number;
  }) {
    await this.authorizedEditor({
      roles: [SubprojectRole.CONSULTANT, SubprojectRole.PM],
      subprojectId: param.subprojectId,
      userId: param.userId,
    });
    return this.prisma.finding.delete({
      where: {
        id: param.findingId,
      },
    });
  }

  private async authorizedEditor(param: {
    userId: number;
    subprojectId: number;
    roles: SubprojectRole[];
  }) {
    const subprojectMember = await this.prisma.subprojectMember.findFirst({
      where: {
        subprojectId: param.subprojectId,
        userId: param.userId,
      },
    });
    if (!subprojectMember) {
      throw unauthorized;
    }

    if (!param.roles.includes(subprojectMember.role)) {
      throw unauthorized;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} finding`;
  }

  update(id: number, updateFindingDto: UpdateFindingDto) {
    return `This action updates a #${id} finding`;
  }

  remove(id: number) {
    return `This action removes a #${id} finding`;
  }
}
