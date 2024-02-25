import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utls/exception/api.exception';
import { getRedis } from 'src/utls/keys/redis.keys';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cahceManager: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(register: RegisterDto) {
    const hashedPassword = await bcrypt.hash(
      register.password,
      roundsOfHashing,
    );
    register.password = hashedPassword;

    let a = await this.prisma.user.create({
      data: register,
    });
    return a;
  }

  async login(login: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: login.email,
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
        return {
          token: tokens,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
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
    });
    const getToken: any = await this.cahceManager.get(
      getRedis().refreshToken(userId),
    );
    console.log(getToken, 'gettoken');

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

    return {
      token: tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async logout(userId: number, accessToken: string) {
    const getToken: any = await this.cahceManager.get(
      getRedis().accessToken(userId),
    );
    console.log(getToken, 'gettoken');

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
}
