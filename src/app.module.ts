import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

import { JwtModule } from '@nestjs/jwt';
import { FileModule } from './file/file.module';
import { FindingModule } from './finding/finding.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ProjectModule,
    SubprojectModule,
    FileModule,
    FindingModule,
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [ChatGateway, AuthService],
})
export class AppModule {}
