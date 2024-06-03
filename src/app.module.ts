import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { EventModule } from './event/event.module';
import { FileModule } from './file/file.module';
import { FindingModule } from './finding/finding.module';
import { OutputModule } from './output/output.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { SubprojectModule } from './subproject/subproject.module';
import { UserModule } from './user/user.module';
import { VCacheModule } from './vcache/vcache.module';


@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      isGlobal: true,
      url: 'redis://localhost:6379'
    }),
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
    OutputModule,
    VCacheModule,
  ],
})
export class AppModule { }
