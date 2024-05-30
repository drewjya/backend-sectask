import { Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { uuid } from 'src/common/uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { noaccess } from 'src/utils/exception/common.exception';
import { CVSS_VALUE, basicCvss } from './finding.enum';

@Injectable()
export class FindingService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
  }

  async create(param: { subprojectId: number; userId: number }) {
    const subproject = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.VIEWER],
    });
    const member = subproject.members.find(
      (member) => member.userId === param.userId,
    );
    if (!member) {
      throw noaccess;
    }
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
          create: {
            data: basicCvss(),
          },
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
              },
            },
          },
        },
      },
    });
    if (!subproject) {
      throw noaccess;
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
        createdBy: {
          select: {
            profilePicture: true,
            id: true,
            name: true,
          },
        },
        subProject: {
          select: {
            name: true,
            id: true,
            project: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        testerFinding: {
          where: {
            userId: param.userId,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                id: true,
                profilePicture: true,
              },
            },
          },
        },
        chatRoom: true,
      },
    });
    if (!finding) {
      throw noaccess;
    }

    return finding;
  }

  async editFindingProperties(param: {
    properties: {
      category?: string;
      location?: string;
      method?: string;
      environment?: string;
      application?: string;
      impact?: string;
      likelihood?: string;
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
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
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

  async editFinding(param: {
    properties: {
      name: string;
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
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let newFInding = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      data: {
        name: param.properties.name,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
    return newFInding;
  }

  async editRetestProperties(param: {
    properties: {
      latestUpdate?: Date;
      // tester?: string;
      status?: string;
      releases?: string;
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
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
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

  async editCVSS(param: {
    cvss: {
      av: CVSS_VALUE;
      ac: CVSS_VALUE;
      at: CVSS_VALUE;
      pr: CVSS_VALUE;
      ui: CVSS_VALUE;
      vc: CVSS_VALUE;
      vi: CVSS_VALUE;
      va: CVSS_VALUE;
      sc: CVSS_VALUE;
      si: CVSS_VALUE;
      sa: CVSS_VALUE;
      s: CVSS_VALUE;
      au: CVSS_VALUE;
      r: CVSS_VALUE;
      v: CVSS_VALUE;
      re: CVSS_VALUE;
      u: CVSS_VALUE;
      mav: CVSS_VALUE;
      mac: CVSS_VALUE;
      mat: CVSS_VALUE;
      mpr: CVSS_VALUE;
      mui: CVSS_VALUE;
      mvc: CVSS_VALUE;
      mvi: CVSS_VALUE;
      mva: CVSS_VALUE;
      msc: CVSS_VALUE;
      msi: CVSS_VALUE;
      msa: CVSS_VALUE;
      cr: CVSS_VALUE;
      ir: CVSS_VALUE;
      ar: CVSS_VALUE;
      e: CVSS_VALUE;
    };
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
        cvssDetailId: true,
      },
    });
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    return this.prisma.cvssDetail.update({
      where: {
        id: finding.cvssDetailId,
      },
      data: {
        data: param.cvss,
      },
    });
  }

  async deleteFinding(param: { userId: number; findingId: number }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
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
    includePm?: boolean;
  }) {
    if (param.includePm === true) {
      const subproject = await this.prisma.subProject.findFirst({
        where: {
          id: param.subprojectId,
        },
        include: {
          project: {
            select: {
              members: {
                select: {
                  userId: true,
                  role: true,
                },
              },
            },
          },
        },
      });
      if (!subproject) {
        throw noaccess;
      }
      const member = subproject.project.members.find(
        (member) => member.userId === param.userId,
      );
      if (!member) {
        throw noaccess;
      }
      if (member.role === ProjectRole.PM) {
        return;
      } else {
        throw noaccess;
      }
    } else {
      const subprojectMember = await this.prisma.subprojectMember.findFirst({
        where: {
          subprojectId: param.subprojectId,
          userId: param.userId,
        },
        include: {
          subproject: {
            select: {
              project: {
                select: {
                  members: {
                    select: {
                      userId: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!subprojectMember) {
        throw noaccess;
      }

      return;
    }
  }
}
