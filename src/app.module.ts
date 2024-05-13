import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { EventModule } from './event/event.module';
import { FileModule } from './file/file.module';
import { FindingModule } from './finding/finding.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    FindingModule,
    ProjectModule,
    SubprojectModule,
    ChatModule,
    EventModule,
    AuthModule,
    FileModule,
  ],
})
export class AppModule {}
