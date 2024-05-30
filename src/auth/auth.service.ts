import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyHased } from 'src/common/encrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import {
  noaccess,
  notfound,
  unauthorized,
} from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';

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
      include: {
        profilePicture: true,
      },
    });
    if (!user) {
      throw unauthorized;
    }
    const isPasswordValid = await verifyHased({
      hashed: user.password,
      value: param.password,
    });
    if (!isPasswordValid) {
      throw unauthorized;
    }
    const tokens = await this.getTokens(user.id, user.email);
    delete user.deletedAt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.password;
    return {
      token: tokens,
      user,
    };
  }
  async register(param: { email: string; name: string; password: string }) {
    const oldUser = await this.prisma.user.findUnique({
      where: { email: param.email },
    });
    if (oldUser) {
      throw new ApiException({
        data: 'email_already_exists',
        status: HttpStatus.CONFLICT,
      });
    }
    const newPassword = await hashPassword(param.password);
    const user = await this.prisma.user.create({
      data: {
        email: param.email,
        name: param.name,
        password: newPassword,
      },
    });
    delete user.deletedAt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.password;
    return user;
  }
  async refresh(param: { userId: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: param.userId },
      include: {
        profilePicture: true,
      },
    });

    if (!user) {
      throw unauthorized;
    }
    delete user.deletedAt;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.password;

    const tokens = await this.getTokens(user.id, user.email);
    return {
      token: tokens,
      user,
    };
  }

  async changePassword(param: {
    userId: number;
    newPassword: string;
    oldPassword: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: param.userId },
    });
    if (!user) {
      throw unauthorized;
    }
    const isPasswordValid = await verifyHased({
      hashed: user.password,
      value: param.oldPassword,
    });
    if (!isPasswordValid) {
      throw noaccess;
    }
    const newPassword = await hashPassword(param.newPassword);
    await this.prisma.user.update({
      where: { id: param.userId },
      data: {
        password: newPassword,
      },
    });
    return {
      message: 'password_changed',
    };
  }

  async editProfie(param: { userId: number; email: string; name: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId,
      },
    });
    if (!user) {
      throw notfound;
    }
    const checkEmail = await this.prisma.user.findFirst({
      where: {
        email: param.email,
      },
    });
    if (checkEmail && checkEmail.id !== user.id) {
      throw new ApiException({
        data: 'email_already_exists',
        status: HttpStatus.CONFLICT,
      });
    }
    return this.prisma.user.update({
      where: {
        id: param.userId,
      },
      data: {
        email: param.email,
        name: param.name,
      },
    });
  }

  async changeProfileImage(param: {
    userId: number;
    file: Express.Multer.File;
  }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId,
      },
    });
    if (user.profilePictureId) {
      const file = await this.prisma.file.delete({
        where: {
          id: user.profilePictureId,
        },
      });
      unlinkFile(file.imagePath);
    }
    return this.prisma.user.update({
      where: {
        id: param.userId,
      },
      data: {
        profilePicture: {
          create: {
            contentType: param.file.mimetype,
            name: param.file.filename,
            imagePath: param.file.path,
          },
        },
      },
    });
  }

  async removeImagePath(param: { userId: number }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId,
      },
    });
    if (user.profilePictureId) {
      const file = await this.prisma.file.delete({
        where: {
          id: user.profilePictureId,
        },
      });
      unlinkFile(file.imagePath);
      return;
    } else {
      throw notfound;
    }
  }
}
