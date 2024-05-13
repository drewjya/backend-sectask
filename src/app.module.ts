import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ChatModule } from './chat/chat.module';
import { FindingModule } from './finding/finding.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';

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
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
