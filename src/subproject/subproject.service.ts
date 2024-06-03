import { HttpStatus, Injectable } from '@nestjs/common';
import { File, ProjectRole } from '@prisma/client';
import { LogQuery } from 'src/common/query/log.query';
import { ProjectQuery } from 'src/common/query/project.query';
import { OutputService } from 'src/output/output.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';
import { noaccess, notfound } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';

@Injectable()
export class SubprojectService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService, private output: OutputService) {
    this.projectQuery = new ProjectQuery(prisma);
  }
  private async editSubprojectMembers(param: {
    subprojectId: number;
    userId: number;
    add: boolean;
    memberId: number;
  }) {
    const subproject = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });

    const projectMembers = await this.prisma.projectMember.findFirst({
      where: {
        projectId: subproject.project.id,
        userId: param.memberId,
      },
      include: {
        subprojectMember: true,
        member: true,
      },
    });
    if (!projectMembers) {
      throw noaccess;
    }
    const approvedRole: ProjectRole = ProjectRole.VIEWER;
    if (approvedRole !== projectMembers.role) {
      throw noaccess;
    }
    if (param.add) {
      const check = projectMembers.subprojectMember.find(
        (e) =>
          e.subprojectId === param.subprojectId && e.userId === param.memberId,
      );

      if (check) {
        throw new ApiException({
          data: 'Member consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.prisma.subprojectMember.create({
        data: {
          projectMember: {
            connect: {
              id: projectMembers.id,
            },
          },
          subproject: {
            connect: {
              id: param.subprojectId,
            },
          },
          user: {
            connect: {
              id: param.memberId,
            },
          },
        },
      });

      
    } else {
      if (!projectMembers.subprojectMember) {
        throw new ApiException({
          data: 'Member not consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      const check = projectMembers.subprojectMember.find(
        (member) => member.subprojectId === param.subprojectId,
      );
      if (!check) {
        throw new ApiException({
          data: 'Member not consultant in subproject',
          status: HttpStatus.BAD_REQUEST,
        });
      }
      await this.prisma.subprojectMember.delete({
        where: {
          id: check.id,
        },
      });
      const findingIds = subproject.findings.map((finding) => {
        return finding.id;
      });
      await this.prisma.testerFinding.updateMany({
        where: {
          findingId: {
            in: findingIds,
          },
          userId: param.memberId,
        },
        data: {
          active: false,
        },
      });
    }
    let query = LogQuery.promoteMemberSubproject({
      memberName:projectMembers.member.name,
      subprojectId:param.subprojectId
    })
    if (!param.add) {
      query = LogQuery.demoteMemberSubproject({
        memberName:projectMembers.member.name,
        subprojectId: param.subprojectId
      })
    }
    const log = await this.prisma.subProjectLog.create(query)    
    let type:'promote'|'demote' = 'promote'
    if (!param.add) {
      type = 'demote'
    }
    
    this.output.subprojectLog(param.subprojectId, log)
    this.output.subprojectMember(type, [subproject.id], ProjectRole.VIEWER, projectMembers.member)
    return;
  }

  async findDetail(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [
        ProjectRole.DEVELOPER,
        ProjectRole.VIEWER,
        ProjectRole.PM,
        ProjectRole.TECHNICAL_WRITER,
      ],
    });
    const subproject = await this.prisma.subProject.findFirst({
      where: {
        id: param.subprojectId,
      },
      include: {
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
        recentActivities: {
          select: {
            title: true,
            description: true,
            createdAt: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                member: true,
              },
            },
          },
        },
        findings: {
          select: {
            id: true,
            name: true,
            createdBy: {
              include: {
                profilePicture: true,
              },
            },
          },
        },
        reports: true,
        attachments: true,
      },
    });

    const consultants = subproject.members.map((member) => {
      return member.user.id;
    });
    const subprojectMember = subproject.project.members.map((member) => {
      return {
        id: member.userId,
        name: member.member.name,
        role: consultants.includes(member.userId) ? 'CONSULTANT' : member.role,
      };
    });
    delete subproject.members;
    delete subproject.project.members;
    return {
      ...subproject,
      subprojectMember,
    };
  }

  async createSubproject(param: {
    projectId: number;
    userId: number;
    startDate: Date;
    endDate: Date;
    name: string;
  }) {
    await this.projectQuery.checkIfProjectActive({
      projectId: param.projectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    const user = await this.prisma.user.findFirst({
      where:{
        id: param.userId,
      }
    })
    const subproject = await this.prisma.subProject.create({
      data: {
        name: param.name,
        project: {
          connect: {
            id: param.projectId,
          },
        },
        endDate: param.endDate,
        startDate: param.startDate,
        recentActivities: LogQuery.createProject({
          userName: user.name
        }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            owner:true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const projectLog = await this.prisma.projectLog.create(LogQuery.createSubprojectOnProjectLog({
      subprojectName: subproject.name,
      userName: subproject.project.owner.name,
      projectId: subproject.projectId,
    }))
    this.output.projectLog(subproject.projectId, projectLog)
    this.output.projectSubproject('add', subproject)
    this.output.subprojectSidebar('add', subproject, subproject.project.members.map((e) => e.userId))
    return;
  }

  async updateSubprojectHeader(param: {
    subprojectId: number;
    userId: number;
    name: string;
    startDate: Date;
    endDate: Date;
  }) {
    const oldSubproject = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    const user = await this.prisma.user.findFirst({
      where:{
        id: param.userId,
      }
    })
    const subproject = await this.prisma.subProject.update({
      where: {
        id: param.subprojectId,
      },
      data: {
        name: param.name,
        startDate: param.startDate,
        endDate: param.endDate,
      },
      include:{
        project: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            name: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      }
    });
    let query:{
      data: {
          title: string;
          description: string;
          subproject: {
              connect: {
                  id: number;
              };
          };
      };
  }
  ;
    if (oldSubproject.name !== subproject.name) {
      query = LogQuery.editNameSubProject({
        newName: subproject.name,
        oldName: oldSubproject.name,
        subprojectId: subproject.id,
        userName: user.name,
      })
    }else{
      query = LogQuery.editSubprojectPeriod({
        userName: user.name,
        endDate: subproject.endDate,
        startDate: subproject.startDate,
        subprojectId: subproject.id
      })
    }
    const log = await this.prisma.subProjectLog.create(query)
    
    
    this.output.subprojectLog(subproject.id, log)
    this.output.subprojectHeader(subproject)
    this.output.subprojectSidebar('edit', subproject, subproject.project.members.map((e)=>e.userId))
    return;
  }

  async promoteToConsultant(param: {
    subprojectId: number;
    userId: number;
    memberId: number;
  }) {
    await this.editSubprojectMembers({
      subprojectId: param.subprojectId,
      userId: param.userId,
      memberId: param.memberId,
      add: true,
    });
    return;
    
  }
  async demoteToViewer(param: {
    subprojectId: number;
    userId: number;
    memberId: number;
  }) {
     await this.editSubprojectMembers({
      subprojectId: param.subprojectId,
      userId: param.userId,
      memberId: param.memberId,
      add: false,
    });
    
    return;
  }

  async deleteSubproject(param: { subprojectId: number; userId: number }) {
    await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.PM],
    });
    const subproject = await this.prisma.subProject.delete({
      where: {
        id: param.subprojectId,
      },
    });
    await this.projectQuery.addSubProjectRecentActivities({
      subprojectId: param.subprojectId,
      title: `Subproject Deleted`,
      description: `Subproject has been deleted by [${param.userId}]`,
    });
    return subproject;
  }

  async uploadProjectFile(param: {
    subprojectId: number;
    file: Express.Multer.File;
    originalName: string;
    userId: number;
    acceptRole: ProjectRole;
    type: 'attachment' | 'report';
  }) {
    const user = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [param.acceptRole],
    });
    
  
  

    let query: {
      data: {
        name: string,
        originalName: string,
        contentType: string,
        imagePath: string,
        subProjectReports?: any,
        subProjectAttachments?: any
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
        subProjectAttachments: {
          connect: {
            id: param.subprojectId,
          },
        }
      }
    } else {
      query.data = {
        ...query.data,
        subProjectReports: {
          connect: {
            id: param.subprojectId
          }
        }
      }
    }
    const file  = await this.prisma.file.create(query)
    const log = await this.prisma.subProjectLog.create(LogQuery.addFileSubProject({
      type: param.type==="attachment"?"Attachment":"Report",
      fileName: file.originalName??file.name,
      subprojectId: param.subprojectId,
      userName: user.project.owner.name
    }))

    this.output.subprojectFile(param.type, 'add', param.subprojectId, file)
    this.output.subprojectLog(param.subprojectId, log)
  }

  async removeProjectFile(param: {
    subprojectId: number;
    fileId: number;
    userId: number;
    acceptRole: ProjectRole;
    type: 'Attachment'|'Report'
  }) {
    const user = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [param.acceptRole],
    });

    const file = await this.prisma.file.findFirst({
      where: {
        id: param.fileId,
      },
    });
    if (!file) {
      throw notfound;
    }
    const attachment = await this.prisma.file.delete({
      where: {
        id: param.fileId,
      },
    });
    const log = await this.prisma.subProjectLog.create(LogQuery.addFileSubProject({
      type: param.type,
      fileName: file.originalName??file.name,
      subprojectId: param.subprojectId,
      userName: user.project.owner.name
    }))

    this.output.subprojectFile(param.type, 'remove', param.subprojectId, file)
    this.output.subprojectLog(param.subprojectId, log)
    unlinkFile(attachment.imagePath);

    return;
  }
}
