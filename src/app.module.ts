import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { EventModule } from './event/event.module';
import { FileModule } from './file/file.module';
import { FindingModule } from './finding/finding.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';
import { UserModule } from './user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: process.env.STATIC_PATH,
      serveRoot: '/img',
      serveStaticOptions: {},
      exclude: ['/api/*'],
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
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
