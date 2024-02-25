import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utls/exception/api.exception';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
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

      console.log(user);

      if (isPasswordMatching) {
        const tokens = await this.getTokens(user.id, user.email);
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

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
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
    if (!user) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'user_not_found');
    }

    const tokens = await this.getTokens(user.id, user.email);

    return {
      token: tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
