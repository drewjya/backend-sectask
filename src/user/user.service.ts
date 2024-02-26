import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utls/exception/api.exception';
import { EditUserDto } from './dto/editUser.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private upload: FileUploadService,
  ) {}

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        profilePicture: true,
      },
    });
  }

  async updateUser(
    id: number,
    editUser: EditUserDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      let old = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
        include: {
          profilePicture: true,
        },
      });

      let fileData: {
        id: number;
        name: string;
        imagePath: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
      };
      if (old.profilePicture) {
        fileData = await this.upload.updateFile(
          file,
          old.profilePicture.imagePath,
          old.profilePicture.id,
        );
      } else {
        fileData = await this.upload.uploadFile(file);
      }

      let user = await this.prisma.user.update({
        data: {
          name: editUser.name,
          email: editUser.email,
          profilePictureId: fileData.id,
        },
        where: {
          id: id,
        },
        include: {
          profilePicture: true,
        },
      });
      let profilePict = null;
      if (user.profilePicture) {
        let image = await this.upload.getFileUrl(
          user.profilePicture.imagePath,
          user.profilePicture.contentType,
        );
        profilePict = image;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: profilePict,
      };
    }
    let user = await this.prisma.user.update({
      data: {
        name: editUser.name,
        email: editUser.email,
      },
      where: {
        id: id,
      },
      include: {
        profilePicture: true,
      },
    });
    let profilePict = null;
    if (user.profilePicture) {
      let image = await this.upload.getFileUrl(
        user.profilePicture.imagePath,
        user.profilePicture.contentType,
      );
      profilePict = image;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: profilePict,
    };
  }

  async deleteProfilePicture(id: number) {
    let user = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        profilePicture: true,
      },
    });
    if (user.profilePicture) {
      await this.upload.deleteFile(user.profilePicture.imagePath);
      let newUser = await this.prisma.user.update({
        data: {
          profilePictureId: null,
        },
        where: {
          id: id,
        },
      });
      await this.prisma.file.delete({
        where: {
          id: user.profilePicture.id,
        },
      });
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profilePicture: null,
      };
    } else {
      throw new ApiException(400, 'no_profile_picture');
    }
  }
}
