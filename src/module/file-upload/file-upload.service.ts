import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { BufferedFile } from 'src/module/minio-client/entity/file.entity';
import { MinioClientService } from 'src/module/minio-client/minio-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { AddFileDto, DocumentType, FileType } from './dto/addFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';

@Injectable()
export class FileUploadService {
  constructor(
    private minioClientService: MinioClientService,
    private prisma: PrismaService,
  ) {}

  async uploadFile(image: Express.Multer.File) {
    try {
      let uploadedImage = await this.minioClientService.upload(
        this.convertToBufferedFile(image),
      );
      const file = await this.prisma.file.create({
        data: {
          contentType: image.mimetype,
          imagePath: uploadedImage,
          name: image.originalname,
        },
      });
      return file;
    } catch (error) {
      throw error;
    }
  }

  async updateFile(image: Express.Multer.File, name: string, id: number) {
    try {
      console.log(name);

      let uploadedImage = await this.minioClientService.upload(
        this.convertToBufferedFile(image),
        name,
      );
      const file = await this.prisma.file.update({
        data: {
          imagePath: uploadedImage,
          name: image.originalname,
        },
        where: {
          id: id,
        },
      });
      return file;
    } catch (error) {
      throw error;
    }
  }

  private convertToBufferedFile(file: Express.Multer.File): BufferedFile {
    return {
      buffer: file.buffer,
      encoding: file.encoding,
      fieldname: file.fieldname,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
    };
  }

  public async getFileUrl(name: string, contentType: string) {
    let url = await this.minioClientService.generateUrl(name, contentType);
    return url;
  }

  public async deleteFile(name: string) {
    return this.minioClientService.delete(name);
  }

  public async createFileAttachment(
    userId: number,
    newFile: AddFileDto,
    file: Express.Multer.File,
  ) {
    let uploadedImage = await this.minioClientService.upload(
      this.convertToBufferedFile(file),
    );
    let documentId = parseInt(`${newFile.documentId}`);
    let attachment;
    let report;
    if (newFile.type === FileType.ATTACHMENT) {
      attachment = {
        create: {
          contentType: file.mimetype,
          imagePath: uploadedImage,
          name: file.originalname,
        },
      };
    } else {
      report = {
        create: {
          contentType: file.mimetype,
          imagePath: uploadedImage,
          name: file.originalname,
        },
      };
    }
    let role: ProjectRole =
      newFile.type === FileType.ATTACHMENT
        ? ProjectRole.DEVELOPER
        : ProjectRole.TECHNICAL_WRITER;
    if (newFile.documentType === DocumentType.PROJECT) {
      let oldProject = await this.prisma.project.findFirst({
        where: {
          id: documentId,
          members: {
            some: {
              memberId: userId,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!oldProject) {
        throw new ApiException(400, 'project_not_found');
      }

      let isMember = oldProject.members.some(
        (val) => val.memberId === userId && val.role === role,
      );
      console.log(oldProject.members);

      if (!isMember) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden_project');
      }

      let project = await this.prisma.project.update({
        data: {
          attachments: attachment,
          reports: report,
        },
        where: {
          id: documentId,
        },
      });
      await this.prisma.recentActivites.update({
        data: {
          title: `Project ${project.name} Updated`,
          description: `New file has been added to project ${project.name}`,
        },
        where: {
          id: project.recentActivitesId,
        },
      });
      return project;
    } else if (newFile.documentType === DocumentType.SUBPROJECT) {
      let oldProject = await this.prisma.subProject.findFirst({
        where: {
          id: documentId,
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!oldProject) {
        throw new ApiException(400, 'project_not_found');
      }

      let isMember = oldProject.members.some(
        (val) => val.userId === userId && val.role === role,
      );
      if (!isMember) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden_subproject');
      }

      let project = await this.prisma.subProject.update({
        data: {
          attachments: attachment,
          reports: report,
        },
        where: {
          id: documentId,
        },
      });
      await this.prisma.recentActivites.update({
        data: {
          title: `SubProject ${project.name} Updated`,
          description: `New file has been added to project ${project.name}`,
        },
        where: {
          id: project.recentActivitesId,
        },
      });
      return project;
    }
    throw new ApiException(400, 'invalid_document_type');
  }

  async deleteFileAttachment(
    userId: number,
    fileId: number,
    deleteFile: DeleteFileDto,
  ) {
    let documentId = parseInt(`${deleteFile.documentId}`);
    let role =
      deleteFile.type === FileType.ATTACHMENT
        ? ProjectRole.DEVELOPER
        : ProjectRole.TECHNICAL_WRITER;
    let file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
      },
    });
    let attachment = null;
    let reports = null;
    if (deleteFile.type === FileType.ATTACHMENT) {
      attachment = {
        delete: {
          id: fileId,
        },
        disconnect: {
          id: fileId,
        },
      };
    } else {
      reports = {
        delete: {
          id: fileId,
        },
        disconnect: {
          id: fileId,
        },
      };
    }

    if (!file) {
      throw new ApiException(400, 'file_not_found');
    }

    if (deleteFile.documentType === DocumentType.PROJECT) {
      let project = await this.prisma.project.findFirst({
        where: {
          id: documentId,
          members: {
            some: {
              memberId: userId,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!project) {
        throw new ApiException(400, 'project_not_found');
      }

      let isMember = project.members.some(
        (val) => val.memberId === userId && val.role === role,
      );
      if (!isMember) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden');
      }
      let projectData: {
        id: number;
        name: string;
        archived: boolean;
        startDate: Date;
        endDate: Date;
        projectPictureId: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        recentActivitesId: number;
      };
      if (attachment) {
        projectData = await this.prisma.project.update({
          data: {
            attachments: attachment,
          },
          where: {
            id: documentId,
          },
        });
      }
      if (reports) {
        projectData = await this.prisma.project.update({
          data: {
            reports: reports,
          },
          where: {
            id: documentId,
          },
        });
      }
      await this.deleteFile(file.imagePath);
      await this.prisma.recentActivites.update({
        data: {
          title: `Project ${projectData.name} Updated`,
          description: `${deleteFile.type} has been deleted from project ${projectData.name}`,
        },
        where: {
          id: projectData.recentActivitesId,
        },
      });
      return projectData;
    } else {
      let subproject = await this.prisma.subProject.findFirst({
        where: {
          id: documentId,
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!subproject) {
        throw new ApiException(400, 'project_not_found');
      }

      let isMember = subproject.members.some(
        (val) => val.userId === userId && val.role === role,
      );
      if (!isMember) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'forbidden');
      }
      let projectData = await this.prisma.subProject.update({
        data: {
          attachments: attachment,
          reports: reports,
        },
        where: {
          id: documentId,
        },
        include: {
          project: true,
        },
      });
      await this.deleteFile(file.imagePath);

      await this.prisma.$transaction([
        this.prisma.recentActivites.update({
          data: {
            title: `Project ${projectData.project.name} Updated`,
            description: `${deleteFile.type} has been deleted from project ${projectData.project.name}`,
          },
          where: {
            id: projectData.project.recentActivitesId,
          },
        }),
        this.prisma.recentActivites.update({
          data: {
            title: `SubProject ${projectData.name} Updated`,
            description: `${deleteFile.type} has been deleted from subproject ${projectData.name}`,
          },
          where: {
            id: projectData.recentActivitesId,
          },
        }),
      ]);

      return projectData;
    }
  }
}
