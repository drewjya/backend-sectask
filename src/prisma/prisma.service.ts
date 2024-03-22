import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
  }
  async onModuleInit() {
    // this.$on('query', (e) => {
    //   this.logger.log(e.query);
    // });
    await this.$connect();
  }
}
