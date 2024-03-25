import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FileUploadModule } from 'src/module/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/accessToken.stategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  imports: [
    PrismaModule,
    FileUploadModule,
    PassportModule,
    JwtModule.register({}),
  ],
})
export class AuthModule {}
