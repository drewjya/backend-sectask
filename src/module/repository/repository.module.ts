import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BlockRepository, FindingRepository } from './repo';
import { RecentActivitiesRepository } from './repo/recent_activities.repository';

@Module({
  controllers: [],
  providers: [BlockRepository, FindingRepository, RecentActivitiesRepository],
  exports: [BlockRepository, FindingRepository, RecentActivitiesRepository],
  imports: [PrismaModule],
})
export class RepositoryModule {}
