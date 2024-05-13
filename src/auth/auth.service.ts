import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyHased } from 'src/common/encrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '1d', secret: process.env.JWT_ACCESS_SECRET },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async login(param: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: param.email },
    });
    if (!user) {
      throw new ApiException({
        data: 'unauthorized',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    const isPasswordValid = await verifyHased({
      hashed: user.password,
      value: param.password,
    });
    if (!isPasswordValid) {
      throw new ApiException({
        data: 'unauthorized',
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    const tokens = await this.getTokens(user.id, user.email);
    return {
      token: tokens,
      user,
    };
  }
    async register(param: { email: string; name: string; password: string }) {
      
  }
  async refresh(param: { userId: number }) {}
  async changePassword(param: {
    userId: number;
    newPassword: string;
    oldPassword: string;
  }) {}
}
