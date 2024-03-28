import { Injectable } from '@nestjs/common';
import { Finding } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  FindingCreateInput,
  FindingGetParam,
  FindingInfoResult,
  UpdateFinding,
} from '../../finding/type/finding.type';

@Injectable()
export class FindingRepository {
  constructor(private prisma: PrismaService) {}

  updateFinding(params: {
    userId: number;
    findingId: number;
    data: UpdateFinding;
  }): Promise<Finding> {
    const { userId, findingId, data } = params;
    return this.prisma.finding.update({
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
      data: data,
    });
  }

  createFinding(params: FindingCreateInput): Promise<Finding> {
    const { data, subproject, userId } = params;
    return this.prisma.finding.create({
      data: {
        name: 'Untitled',
        risk: '',
        findingDate: new Date(),
        subProject: {
          connect: {
            id: subproject.id,
          },
        },
        recentActivities: {
          create: {
            title: 'New Finding Created',
            description: `User #${userId} created a new finding in subproject ${subproject.name}`,
          },
        },
      },
    });
  }

  getFindingById<IncludeExtended extends boolean>(
    params: FindingGetParam<IncludeExtended>,
  ): Promise<FindingInfoResult<IncludeExtended>> {
    const { findingId, whereMemberIs, include } = params;
    const INFO = {
      include: {
        nextBlock: {
          select: {
            id: true,
          },
        },
      },
    };
    return this.prisma.finding.findUnique({
      where: {
        id: findingId,
        subProject: whereMemberIs
          ? {
              members: {
                some: whereMemberIs,
              },
            }
          : null,
      },
      include: include
        ? {
            recentActivities: true,
            description: INFO,
            businessImpact: INFO,
            recomendation: INFO,
            retestResult: INFO,
            subProject: {
              select: {
                id: true,
                projectId: true,
              },
            },
            threatAndRisk: INFO,
          }
        : null,
    });
  }
}
