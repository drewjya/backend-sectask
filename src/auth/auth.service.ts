import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { getRedis } from 'src/utils/keys/redis.keys';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cahceManager: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private fileService: FileUploadService,
  ) {}
  async register(register: RegisterDto) {
    const hashedPassword = await bcrypt.hash(
      register.password,
      roundsOfHashing,
    );
    register.password = hashedPassword;

    let user = await this.prisma.user.create({
      data: register,
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: null,
    };
  }

  async login(login: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: login.email,
      },
      include: {
        profilePicture: true,
      },
    });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        login.password,
        user.password,
      );
      if (isPasswordMatching) {
        const tokens = await this.getTokens(user.id, user.email);

        await Promise.all([
          await this.updateRefreshToken(user.id, tokens.refreshToken, true),
          await this.updateRefreshToken(user.id, tokens.accessToken, false),
        ]);
        let profilePict = null;
        if (user.profilePicture) {
          let image = await this.fileService.getFileUrl(
            user.profilePicture.imagePath,
            user.profilePicture.contentType,
          );
          profilePict = image;
        }
        return {
          token: tokens,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profilePicture: profilePict,
          },
        };
      }
      throw new ApiException(HttpStatus.UNAUTHORIZED, 'invalid_credentials');
    }

    throw new ApiException(HttpStatus.UNAUTHORIZED, 'invalid_credentials');
  }

  async updateRefreshToken(userId: number, token: string, refresh: boolean) {
    const hashedRefreshToken = await bcrypt.hash(token, 10);
    if (refresh) {
      this.cahceManager.set(
        getRedis().refreshToken(userId),
        hashedRefreshToken,
        3600 * 7 * 1000,
      );
    } else {
      this.cahceManager.set(
        getRedis().accessToken(userId),
        hashedRefreshToken,
        3600 * 1000,
      );
    }
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '1h', secret: process.env.JWT_ACCESS_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '30d', secret: process.env.JWT_REFRESH_SECRET },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profilePicture: true,
      },
    });
    const getToken: any = await this.cahceManager.get(
      getRedis().refreshToken(userId),
    );

    if (!user) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'user_not_found');
    }
    if (!getToken) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, 'invalid_refresh_token');
    }
    const isTokenMatching = await bcrypt.compare(refreshToken, getToken);
    if (!isTokenMatching) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, 'invalid_refresh_token');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await Promise.all([
      await this.updateRefreshToken(user.id, tokens.refreshToken, true),
      await this.updateRefreshToken(user.id, tokens.accessToken, false),
    ]);
    let profilePict = null;
    if (user.profilePicture) {
      let image = await this.fileService.getFileUrl(
        user.profilePicture.imagePath,
        user.profilePicture.contentType,
      );
      profilePict = image;
    }
    return {
      token: tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: profilePict,
      },
    };
  }

  async logout(userId: number, accessToken: string) {
    const getToken: any = await this.cahceManager.get(
      getRedis().accessToken(userId),
    );

    if (!getToken) {
      return true;
    }

    const isTokenMatching = await bcrypt.compare(accessToken, getToken);

    if (!isTokenMatching) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, 'invalid_access_token');
    }

    await Promise.all([
      this.cahceManager.del(getRedis().refreshToken(userId)),
      this.cahceManager.del(getRedis().accessToken(userId)),
    ]);
    return true;
  }

  async changePassword(userId: number, changePassword: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'user_not_found');
    }
    const isPasswordMatching = await bcrypt.compare(
      changePassword.oldPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, {
        oldPassword: 'invalid_password',
      });
    }
    const hashedPassword = await bcrypt.hash(
      changePassword.newPassword,
      roundsOfHashing,
    );
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    return true;
  }
}
