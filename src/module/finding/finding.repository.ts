import { Injectable } from '@nestjs/common';
import { Finding, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface FindingRepository {
  createFinding(params: { data: Prisma.FindingCreateInput }): Promise<Finding>;
  getFinding(params: {});

}

@Injectable()
export class IFindingRepository implements FindingRepository {
  constructor(private prisma: PrismaService) {}
  createFinding(params: { data: Prisma.FindingCreateInput }): Promise<Finding> {
    const { data } = params;
    return this.prisma.finding.create({ data });
  }

  async getFinding(params: {}) {
    const {} = params;
    // const data = await this.prisma.finding.find
  }
}
