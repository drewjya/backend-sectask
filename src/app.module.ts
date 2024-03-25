import { Module } from '@nestjs/common';

import { AuthController } from './module/auth/auth.controller';
import { AuthModule } from './module/auth/auth.module';
import { AuthService } from './module/auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';

// import { WsJwtGuard } from './auth/ws-jwt/ws-jwt.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsModule } from './module/events/events.module';
import { FindingModule } from './module/finding/finding.module';


import { FileUploadModule } from './module/file-upload/file-upload.module';
import { ProjectModule } from './module/project/project.module';
import { SubprojectModule } from './module/subproject/subproject.module';
import { MinioClientModule } from './module/minio-client/minio-client.module';

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
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
