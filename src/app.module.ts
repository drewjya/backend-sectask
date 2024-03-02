import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';

// import { WsJwtGuard } from './auth/ws-jwt/ws-jwt.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsModule } from './events/events.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FindingModule } from './finding/finding.module';
import { MessageModule } from './message/message.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ProjectModule,
    EventEmitterModule.forRoot(),
    SubprojectModule,
    FindingModule,
    JwtModule,
    CacheModule.register({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      },

      isGlobal: true,
    }),

    MinioClientModule,
    FileUploadModule,
    EventsModule,
    MessageModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
