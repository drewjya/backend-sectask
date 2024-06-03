import { HttpStatus, Injectable } from '@nestjs/common';
import { ProjectRole } from '@prisma/client';
import { LogQuery } from 'src/common/query/log.query';
import { ProjectQuery } from 'src/common/query/project.query';
import { OutputService } from 'src/output/output.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { noaccess, notfound } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';
import { CreateProjectDto } from './request/project.request';

@Injectable()
export class ProjectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService, private output: OutputService) {
    this.projectQuery = new ProjectQuery(prisma);
  }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId
      }
    })
    let members: { role: ProjectRole; userId: number }[] = [
      { role: ProjectRole.PM, userId: userId },
    ];
    if (createProjectDto.members.length > 0) {
      members = [...members, ...createProjectDto.members];
    }
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        archived: false,
        endDate: createProjectDto.endDate,
        startDate: createProjectDto.startDate,
        members: {
          create: members,
        },
        owner: {
          connect: {
            id: userId,
          },
        },
        recentActivities: LogQuery.createProject({
          userName: user.name
        }),
      },
    });
    this.output.projectSidebar('add', project, members.map((e) => e.userId))
    return project;
  }

  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        attachments: true,
        reports: true,
        recentActivities: {
          select: {
            title: true,
            description: true,
            createdAt: true,
          },
        },
        projectPicture: true,
        members: {
          select: {
            role: true,
            member: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subProjects: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            members: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw notfound;
    }
    const isMember = project.members.some(
      (member) => member.member.id === userId,
    );
    if (!isMember) {
      throw noaccess;
    }
    const members = project.members.map((member) => {
      return {
        role: member.role,
        id: member.member.id,
        name: member.member.name,
      };
    });
    return {
      ...project,
      members,
    };
  }

  async findActiveProject(userId: number) {

    return this.projectQuery.getProjectByStatus({ userId, active: true });
  }

  findSidebarProject(userId: number) {
    return this.projectQuery.getProjectSidebar({ userId, active: true });
  }

  findSidebarSubProject(userId: number, projectId: number) {
    return this.projectQuery.getSubprojectSidebar({
      userId,
      projectId,
    });
  }
  findSidebarFInding(userId: number, subprojectId: number) {
    return this.projectQuery.getFindingSidebar({
      userId,
      subprojectId,
    });
  }

  findArchivedProject(userId: number) {
    return this.projectQuery.getProjectByStatus({ userId, active: false });
  }

  async findRecentUpdates(userId: number) {
    return this.projectQuery.fetchRecentActivitiesByUserId(userId);
  }

  async archivedProject(projectId: number, userId: number) {
    await this.projectQuery.checkIfProjectActive({
      projectId,
      userId,
      role: [ProjectRole.PM],
    });
    const log = await this.prisma.$transaction(async (tx) => {

      const project = await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          archived: true,
        },
        include: {
          owner: {
            select: {
              name: true,
            }
          }
        }
      });
      const log = await tx.projectLog.create(LogQuery.archived({
        projectId: project.id,
        projectName: project.name,
        userName: project.owner.name
      }))
      return log

    })
    this.output.projectLog(projectId, log)
  }

  async searchMember(param: { email: string; projectId: number }) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: param.email,
        },
        projects: {
          none: {
            id: param.projectId,
          },
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });
    return users;
  }
  async searchMemberInit(param: { email: string; userId: number }) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: param.email,
        },
        NOT: {
          id: param.userId,
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });
    return users;
  }

  async addMember(param: {
    userId: number;
    role: ProjectRole;
    projectId: number;
    adminId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.adminId,
      role: [ProjectRole.PM],
    });
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId,
      },
    });
    if (!user) {
      throw notfound;
    }
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: param.projectId,
        userId: param.userId,
      },
    });
    if (projectMember) {
      throw new ApiException({
        status: HttpStatus.FORBIDDEN,
        data: 'duplicate',
      });
    }
    const { newMem, project, log } = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: {
          id: param.projectId,
        },
        data: {
          members: {
            create: {
              userId: param.userId,
              role: param.role,
            },
          },
        },
        include: {
          subProjects: {
            select: {
              name: true,
              id: true,
              recentActivities: true,
            },
          },
        },
      });
      const newMem = await tx.user.findFirst({
        where: {
          id: param.userId,
        },
      });
      const log = await tx.projectLog.create(LogQuery.addMemberProject({
        memberName: user.name,
        projectId: project.id
      }))

      return { project, newMem, log };
    })
    this.output.projectLog(project.id, log)
    this.output.projectSidebar('add', project, [newMem.id])
    this.output.projectMember('add', project.id, param.role, newMem)
    this.output.subprojectMember('add', project.subProjects.map((subproject) => subproject.id), param.role, newMem)

  }

  async removeMember(param: {
    userId: number;
    projectId: number;
    adminId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.adminId,
      role: [ProjectRole.PM],
    });

    const findProjectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: param.projectId,
        userId: param.userId,
      },
      include: {
        subprojectMember: {
          include: {
            subproject: true,
          },
        },
        project: true,
        member: true,
      },
    });

    if (!findProjectMember) {
      throw notfound;
    }
    const log = await this.prisma.$transaction(async (tx) => {
      await tx.projectMember.delete({
        where: {
          id: findProjectMember.id,
        },
      });
      const removeProject = LogQuery.removeMemberProject({
        memberName: findProjectMember.member.name,
        projectId: param.projectId,
      })
      return await tx.projectLog.create(removeProject)
    })
    this.output.projectLog(param.projectId, log)
    this.output.projectMember('remove', param.projectId, ProjectRole.VIEWER, findProjectMember.member)
    this.output.projectSidebar('remove', findProjectMember.project, [findProjectMember.member.id])
    return findProjectMember.member;
  }

  async editHeader(param: {
    userId: number;
    projectId: number;
    name: string;
    startDate: Date;
    endDate: Date;
  }) {
    const oldData = await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    const { newData, log } = await this.prisma.$transaction(async (tx) => {
      const newData = await tx.project.update({
        where: {
          id: param.projectId,
        },
        data: {
          name: param.name,
          startDate: param.startDate,
          endDate: param.endDate,
        },
        include: {
          owner: true,
          projectPicture: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      });
      const paramData = oldData.name !== newData.name ? LogQuery.editNameProject({
        newName: newData.name,
        oldName: oldData.name,
        projectId: newData.id,
        userName: newData.owner.name
      }) : LogQuery.editPeriod({
        startDate: param.startDate,
        endDate: param.endDate,
        projectId: newData.id,
        userName: newData.owner.name
      });
      const log = await tx.projectLog.create(paramData)
      return {
        log, newData
      }
    })
    this.output.projectLog(param.projectId, log)
    this.output.projectSidebar('edit', newData, newData.members.map((e) => e.userId))
    this.output.projectHeader(newData)

  }

  async editProfileProject(param: {
    projectId: number;
    file: Express.Multer.File;
    userId: number;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    const { log, data } = await this.prisma.$transaction(async (tx) => {
      const oldProject = await tx.project.findFirst({
        include: {
          projectPicture: true,
          owner: true,
        },
        where: {
          id: param.projectId
        }
      })
      if (oldProject.projectPicture) {
        await tx.file.delete({
          where: {
            id: oldProject.projectPicture.id,
          }
        })
      }
      await tx.file.create({
        data: {
          name: param.file.filename,
          contentType: param.file.mimetype,
          imagePath: param.file.path,
          project: {
            connect: {
              id: param.projectId,

            },
          },
        },
      });
      const log = await tx.projectLog.create(LogQuery.addFileProject({
        type: 'File',
        fileName: param.file.filename,
        projectId: param.projectId,
        userName: oldProject.owner.name
      }))
      return { data: oldProject, log }
    })
    if (data.projectPicture) {
      unlinkFile(data.projectPicture.imagePath);
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: param.projectId,
      },
      include: {
        projectPicture: true,
      }
    });
    this.output.projectLog(param.projectId, log)
    this.output.projectHeader(project)
  }

  async deleteProjectProfile(param: {
    projectId: number;

    userId: number;
  }) {
    const find = await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    if (!find.projectPictureId) {
      throw notfound;
    }
    const { file, log } = await this.prisma.$transaction(async (tx) => {
      const project = await tx.user.findFirst({
        where: {
          id: param.userId
        }
      })
      const file = await tx.file.delete({
        where: {
          id: find.projectPictureId,
        },
      });
      const log = await tx.projectLog.create(LogQuery.removeFileProject({
        type: 'File',
        fileName: file.name,
        projectId: param.projectId,
        userName: project.name
      }))
      return {
        file, log
      };
    })

    unlinkFile(file.imagePath);
    const project = await this.prisma.project.findFirst({
      where: {
        id: param.projectId,
      },
      include: {
        projectPicture: true
      }
    });
    this.output.projectLog(param.projectId, log)
    this.output.projectHeader(project)
  }

  async uploadProjectFile(param: {
    projectId: number;
    file: Express.Multer.File;
    originalName: string;
    userId: number;
    acceptRole: ProjectRole[];
    type: 'attachment' | 'report';
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: param.acceptRole,
    });
    const { attachment, log } = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: param.userId
        }
      })
      let query: {
        data: {
          name: string,
          originalName: string,
          contentType: string,
          imagePath: string,
          projectReports?: any,
          projectAttachments?: any
        }
      } = {
        data: {
          name: param.file.filename,
          originalName: param.originalName,
          contentType: param.file.mimetype,
          imagePath: param.file.path,
        },
      };
      if (param.type === "attachment") {
        query.data = {
          ...query.data,
          projectAttachments: {
            connect: {
              id: param.projectId,
            },
          }
        }
      } else {
        query.data = {
          ...query.data,
          projectReports: {
            connect: {
              id: param.projectId
            }
          }
        }
      }
      const attachment = await tx.file.create(query);
      const log = await tx.projectLog.create(LogQuery.addFileProject({
        fileName: attachment.originalName ?? attachment.name,
        projectId: param.projectId,
        type: param.type === 'attachment' ? 'Attachment' : 'Report',
        userName: user.name
      }))
      return { attachment, log }
    })

    this.output.projectLog(param.projectId, log)
    this.output.projectFile(param.type, 'add', param.projectId, attachment)

  }

  async removeProjectFile(param: {
    projectId: number;
    fileId: number;
    userId: number;
    acceptRole: ProjectRole[];
    type: 'Attachment' | 'Report'
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: param.acceptRole,
    });

    const file = await this.prisma.file.findFirst({
      where: {
        id: param.fileId,
      },
    });
    if (!file) {
      throw notfound;
    }
    const { attachment, log } = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          id: param.userId,
        }
      })
      const attachment = await tx.file.delete({
        where: {
          id: param.fileId,
        },
      });
      const log = await tx.projectLog.create(LogQuery.removeFileProject(
        {
          type: param.type,
          fileName: attachment.originalName ?? attachment.name,
          projectId: param.projectId,
          userName: user.name,
        }
      ))
      return { attachment, log }
    })
    this.output.projectLog(param.projectId, log)
    this.output.projectFile(param.type, 'remove', param.projectId, attachment)
    unlinkFile(attachment.imagePath);
    return attachment;
  }
}
