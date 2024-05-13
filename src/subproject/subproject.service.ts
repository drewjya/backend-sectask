import { Injectable } from '@nestjs/common';
import { SubprojectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubprojectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
  }
  async findDetail(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [
        SubprojectRole.CONSULTANT,
        SubprojectRole.DEVELOPER,
        SubprojectRole.GUEST,
        SubprojectRole.PM,
        SubprojectRole.TECHNICAL_WRITER,
      ],
    });
  }
}
