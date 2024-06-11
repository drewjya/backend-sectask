import { Injectable } from '@nestjs/common';
import { DocumentType, ProjectRole, User } from '@prisma/client';
import { LogQuery } from 'src/common/query/log.query';
import { ProjectQuery } from 'src/common/query/project.query';
import { uuid } from 'src/common/uuid';
import { OutputService } from 'src/output/output.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindingWithSubprojectRetest } from 'src/subproject/entity/subproject.entity';
import { noaccess, notfound, unauthorized } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';
import { CvssParam } from './dto/create-finding.dto';
import { basicCvss } from './finding.enum';

@Injectable()
export class FindingService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService, private output: OutputService) {
    this.projectQuery = new ProjectQuery(prisma);
  }
  private async authorizedEditor(param: {
    userId: number;
    subprojectId: number;

  }) {

    const subpro = await this.prisma.subProject.findFirst({
      where: {
        id: param.subprojectId
      },
      select: {
        members: {
          select: {
            user: true
          }
        }
      }
    })
    if (!subpro) {
      throw notfound
    }
    const member = subpro.members.find((e) => e.user.id === param.userId)
    if (!member) {
      throw noaccess;
    }

    return;

  }

  async create(param: { subprojectId: number; userId: number }) {
    const subproject = await this.projectQuery.checkIfSubprojectActive({
      subproject: param.subprojectId,
      userId: param.userId,
      role: [ProjectRole.VIEWER],
    });
    const member = subproject.members.find(
      (member) => member.userId === param.userId,
    );
    if (!member) {
      throw noaccess;
    }
    // const cr = 
    const newFind = await this.prisma.finding.create({

      data: {
        name: 'Untitled Finding',
        subProject: {
          connect: {
            id: param.subprojectId,
          },
        },
        createdBy: {
          connect: {
            id: param.userId,
          },
        },

        cvssDetail: {
          create: {
            data: basicCvss(),
          },
        },
        description: {
          create: {
            data: Buffer.from(''),
            id: 'description' + uuid(),
          }
        },
        threatAndRisk: {
          create: {
            data: Buffer.from(''),
            id: 'threat' + uuid(),
          }
        },
        testerFinding: {
          create: {
            user: {
              connect: {
                id: param.userId,
              },
            },
          },
        },
      },
      include: {
        description: true,
        threatAndRisk: true,

        cvssDetail: {
          select: {
            data: true,
            id: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        subProject: {
          select: {
            id: true,
            project: {
              select: {
                id: true,
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      }
    });

    const description = newFind.description.id
    const threat = newFind.threatAndRisk.id
    const log = await this.prisma.subProjectLog.create(LogQuery.createFinding({
      subprojectId: subproject.id,
      userName: member.user.name,
    }))
    const members = newFind.subProject.project.members.map((member) => member.userId)
    this.output.subprojectLog(param.subprojectId, log)
    this.output.findingSidebar({
      type: 'add',
      finding: newFind,
      projectId: newFind.subProject.project.id,
      subprojectId: newFind.subProject.id,
      userId: members,
    })
    this.output.subprojectFinding('add', newFind)

    return {
      ...newFind,
      description,
      threat
    }
  }

  async notifyEdit(param: { userId: number; findingId: number }) {
    const subproject = await this.prisma.finding.findUnique({
      where: {
        id: param.findingId,
        AND: {
          subProject: {
            members: {
              some: {
                userId: param.userId,
              },
            },
          },
        },
      },
    });
    if (!subproject) {
      throw noaccess;
    }
    return this.prisma.testerFinding.upsert({
      where: {
        userId_findingId: {
          findingId: param.findingId,
          userId: param.userId,
        },
      },
      update: {
        active: true,
      },
      create: {
        user: {
          connect: {
            id: param.userId,
          },
        },
        finding: {
          connect: {
            id: param.findingId,
          },
        },
        active: true,
      },
    });
  }

  async findDetail(param: { userId: number; findingId: number }) {
    const finding = await this.prisma.finding.findFirst({
      where: {
        id: param.findingId,
        AND: {
          subProject: {
            project: {
              members: {
                some: {
                  userId: param.userId,
                },
              },
            },
          },
        },
      },
      include: {
        cvssDetail: true,
        retestHistories: {
          take: 1,
          include: {
            tester: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                email: true

              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        createdBy: {
          select: {
            profilePicture: true,
            id: true,
            name: true,
          },
        },
        subProject: {
          select: {
            name: true,
            id: true,
            startDate: true,
            endDate: true,
            members: {
              select: {
                userId: true,
              },
            },
            project: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        testerFinding: {
          where: {
            userId: param.userId,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                id: true,
                profilePicture: true,
              },
            },
          },
        },
        chatRoom: true,
      },
    });
    if (!finding) {
      throw noaccess;
    }

    const isEditor = finding.subProject.members.find(
      (e) => e.userId === param.userId,
    );

    delete finding.subProject.members;

    let retestProperty
    if (finding.retestHistories && finding.retestHistories.length > 0) {
      retestProperty = {
        lastUpdated: finding.retestHistories[0].createdAt,
        tester: finding.retestHistories[0].tester,
        version: finding.retestHistories[0].version,
        status: finding.retestHistories[0].status
      }

    }
    delete finding.retestHistories

    return {
      ...finding,
      retestProperty,
      isEditor: isEditor ? true : false,
    };
  }

  async editFindingProperties(param: {
    properties: {
      category?: string;
      location?: string;
      method?: string;
      environment?: string;
      application?: string;
      impact?: string;
      likelihood?: string;
    };
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let newFInding = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      data: {
        category: param.properties.category,
        location: param.properties.location,
        method: param.properties.method,
        environment: param.properties.environment,
        application: param.properties.application,
        impact: param.properties.impact,
        likelihood: param.properties.likelihood,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
    this.output.findingFProp({
      values: param.properties,
      findingId: param.findingId
    })
    return newFInding;
  }

  async editFinding(param: {
    properties: {
      name: string;
    };
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    if (!finding) {
      throw noaccess;
    }
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let newFInding = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        subProject: {
          select: {
            id: true,
            project: {
              select: {
                id: true,
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
      data: {
        name: param.properties.name,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
    this.output.subprojectFinding('edit', newFInding)
    const member = newFInding.subProject.project.members.map((member) => member.userId)
    this.output.findingSidebar({
      type: 'edit',
      userId: member,
      subprojectId: newFInding.subProjectId,
      projectId: newFInding.subProject.project.id,
      finding: newFInding,
    })
    this.output.findingHeader(newFInding.id, newFInding.name)
    return newFInding;
  }


  async createRetest(param: {
    userId: number;
    status: string;
    version: string;
    content: string;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: {
        id: param.findingId
      }
    })
    if (!finding) {
      throw notfound
    }
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    })

    const retest = await this.prisma.retestHistory.create({
      data: {
        tester: {
          connect: {
            id: param.userId,
          }
        },
        finding: {
          connect: {
            id: finding.id,
          },
        }, content: param.content,
        status: param.status,
        version: param.version,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        findingId: true,
        tester: {
          include: {
            profilePicture: true,
          }
        },
        version: true,
      }
    })

    //TODO: ADD LOG
    //TODO: ADD EVENT
    this.output.findingRetest({
      retest: retest,
      findingId: param.findingId,
    })
  }


  async getRetestList(param: {
    findingId: number
    userId: number
  }) {
    const { finding, user } = await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId,
      retest: true
    })

    if (finding.retestHistories) {

      finding.retestHistories.forEach((e) => {
        delete e.tester.password
        delete e.tester.profilePictureId
        delete e.tester.createdAt
        delete e.tester.deletedAt
        delete e.tester.updatedAt

      })
      return finding.retestHistories
    }
    return []
  }


  async getRetestDetail(param: {
    retestId: number;
    userId: number;
    findingId: number
  }) {
    await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId,
    })
    const retest = await this.prisma.retestHistory.findFirst({
      where: {
        id: param.retestId,
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        tester: {
          include: {
            profilePicture: true,
          }
        },
        content: true,
        version: true,
      }
    })
    delete retest.tester.password
    delete retest.tester.createdAt
    delete retest.tester.deletedAt
    return retest;
  }

  async editCVSS(param: {
    cvss: CvssParam;
    userId: number;
    findingId: number;
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
        cvssDetail: true
      },
    });

    if (!finding) {
      throw noaccess;
    }

    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    const val = await this.prisma.cvssDetail.update({
      where: {
        id: finding.cvssDetail.id,
      },
      data: {
        data: param.cvss,
      },
    });
    this.output.findingCvss(val)
  }

  async deleteFinding(param: { userId: number; findingId: number }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        deletedAt: true,
        name: true,
        descriptionId: true,
        threatAndRiskId: true,
        FindingFile: {
          include: {
            file: true,
          }
        },
        subProject: {
          select: {
            id: true,
            project: {
              select: {
                ownerId: true
              }
            }
          }
        }

      },
    });
    if (finding.deletedAt && finding.subProject.project.ownerId === param.userId) {

      finding.FindingFile.forEach(element => {
        unlinkFile(element.file.imagePath)
      });
      let document: string[] = []
      if (finding.descriptionId) {
        document.push(finding.descriptionId)
      }
      if (finding.threatAndRiskId) {
        document.push(finding.threatAndRiskId)
      }


      const data = await this.prisma.$transaction(async (tx) => {
        await tx.file.deleteMany({
          where: {
            findingFile: {
              findingId: param.findingId
            }
          }
        })
        const newF = await tx.finding.delete({
          where: {
            id: param.findingId,
          },
          include: {
            subProject: {
              include: {
                project: {
                  include: {
                    members: true,
                  }
                }
              }
            },
            createdBy: {
              include: {
                profilePicture: true,
              }
            }
          }
        })
        await tx.document.deleteMany({
          where: {
            id: {
              in: document
            }
          }
        })
        const user = await tx.user.findFirst({
          where: {
            id: param.userId
          }
        })
        const log = await tx.subProjectLog.create(LogQuery.deleteFinding({
          userName: user.name,
          subprojectName: finding.name,
          subprojectId: finding.subProject.id,
          approved: true,
        }))

        return {
          newF, log
        }

      })
      this.output.subprojectFinding('remove', data.newF)
      this.output.findingSidebar({
        type: 'remove',
        userId: data.newF.subProject.project.members.map(e => e.userId),
        finding: data.newF,
        projectId: data.newF.subProject.projectId,
        subprojectId: data.newF.subProjectId
      })
      this.output.subprojectLog(data.newF.subProjectId, data.log)
      this.output.findingDeleted(param.findingId, 'approved')
      return data.newF
    }
    await this.authorizedEditor({
      subprojectId: finding.subProject.id,
      userId: param.userId,
    });
    if (finding.deletedAt) {
      throw noaccess
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId
      }
    })
    const data = await this.prisma.finding.update({
      where: {
        id: param.findingId,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    const log = await this.prisma.subProjectLog.create(LogQuery.deleteFinding({
      userName: user.name,
      subprojectName: finding.name,
      subprojectId: finding.subProject.id,
      approved: false,
    }))
    this.output.subprojectFinding('edit', data)
    this.output.subprojectLog(finding.subProject.id, log)
    this.output.findingDeleted(param.findingId, 'deleted')
  }

  async uploadImageForTiptap(param: { findingId: number, userId: number, file: Express.Multer.File, originalName?: string }) {
    const { file, findingId, userId, originalName } = param
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      }
    })
    if (!user) {
      throw unauthorized
    }
    const uploadFile = await this.prisma.findingFile.create({
      data: {
        finding: {
          connect: {
            id: findingId,
          }

        },
        file: {
          create: {
            contentType: file.mimetype,
            imagePath: file.path,
            name: file.filename,
            originalName: originalName,
          }
        }

      },
      include: {
        file: true
      }
    })
    return uploadFile.file;
  }

  async deleteImageTiptap(param: {
    userId: number, name: string,
    findingId?: number,
    fileId?: number
  }) {
    const { name, userId, fileId, findingId } = param
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      }
    })
    if (!user) {
      throw unauthorized
    }
    let newFIleId = fileId
    if (!newFIleId) {
      const uploadFile = await this.prisma.file.findFirst({
        where: {
          name: name
        }
      })
      if (!uploadFile) {
        throw notfound
      }
      newFIleId = uploadFile.id
    }
    const deleteFile = await this.prisma.file.delete({
      where: {
        id: fileId
      },

    })
    unlinkFile(deleteFile.imagePath);
    return;
  }

  async getVersion(param: {
    findingId: number,
    type: DocumentType,
  }) {
    const versions = await this.prisma.versionList.findMany({
      where: {
        findingId: param.findingId,
        type: param.type
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          }
        }
      }

    })
    return versions;
  }

  async saveFindingVersion(param: {
    userId: number,
    findingId: number,
    content: string,
    type: DocumentType,
    basedOn?: number
  }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
        cvssDetail: true
      },
    });

    if (!finding) {
      throw noaccess;
    }

    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    let date: Date | undefined;
    if (param.basedOn) {
      const findVersion = await this.prisma.versionList.findFirst({
        where: {
          id: param.basedOn
        }
      })
      if (findVersion) {
        date = findVersion.createdAt;
      }

    }

    const version = await this.prisma.versionList.create({
      data: {
        finding: {
          connect: {
            id: param.findingId
          },
        },
        user: {
          connect: {
            id: param.userId
          }
        },
        basedOn: date,
        content: param.content,
        type: param.type,

      }
    })

  }

  async getAllChatRoom(param: {
    userId: number, findingId: number
  }) {

    const { finding } = await await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId
    })

    const chatrooms = this.prisma.chatRoom.findMany({
      where: {
        findingId: finding.id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            name: true,
            id: true,
            profilePicture: true
          }

        },
      }
    })


    return chatrooms
  }

  async createRoomChat(param: {
    userId: number,
    findingId: number,
    title: string
  }) {
    const { user, finding } = await await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId
    })
    const chatRoom = await this.prisma.chatRoom.create({
      data: {
        title: param.title,
        finding: {
          connect: {
            id: finding.id
          }
        },
        createdBy: {
          connect: {
            id: param.userId
          }
        }
      },
      include: {
        createdBy: {

          select: {
            name: true,
            id: true,
            profilePicture: true
          }
        }
      }
    })

    const log = await this.prisma.subProjectLog.create(LogQuery.createNewDiscussion({
      discussionName: chatRoom.title,
      findingName: finding.name,
      subprojectId: finding.subProjectId,
      userName: user.name
    }))

    this.output.subprojectLog(finding.subProjectId, log)
    this.output.roomChat(chatRoom)
    return;

  }


  async createChats(
    param: {
      userId: number,
      replyChatId?: number,
      findingId: number,
      chatroomId: number
      value: string,
    }
  ) {
    const { user } = await await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId
    })
    const newChat = await this.prisma.chat.create({
      data: {
        content: param.value,
        chatRoom: {
          connect: {
            id: param.chatroomId,
          },
        },
        sender: {
          connect: {
            id: user.id
          },
        },

        replyChat: param.replyChatId ? {
          connect: {
            id: param.replyChatId
          }
        } : undefined,

      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        replyChat: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          }
        }
      }
    },)

    this.output.sendChat(param.chatroomId, newChat)

    return
  }


  async searchRoomChat(param: {
    userId: number;
    findingId: number;
    name: string;
  }) {
    const { finding } = await await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId
    })
    return this.prisma.chatRoom.findMany({
      where: {
        findingId: finding.id,
        title: {
          startsWith: param.name
        }
      },

      include: {
        createdBy: {
          select: {
            name: true,
            id: true,
            profilePicture: true
          }

        },
      }
    })
  }

  async getRoomChatDetail(param: {
    userId: number;
    findingId: number;
    chatRoomId: number
  }) {
    await this.checkMemberFinding({
      findingId: param.findingId,
      userId: param.userId
    })
    return this.prisma.chatRoom.findFirst({
      where: {
        id: param.chatRoomId,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            id: true,
            profilePicture: true
          }

        },
        chats: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
            replyChat: {
              select: {
                content: true,
                createdAt: true,
                sender: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              }
            }
          }
        }
      }

    })
  }


  private async checkMemberFinding(param: {
    userId: number,
    findingId: number,
    retest?: boolean
  }): Promise<{ finding: FindingWithSubprojectRetest, user: User }> {
    let query = {}
    if (param.retest === true) {
      query = {
        retestHistories: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            createdAt: true,
            status: true,
            id: true,
            version: true,
            tester: {
              include: {
                profilePicture: true,
              }
            }
          }
        }
      }
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: param.userId
      }
    })
    if (!user) {
      throw unauthorized;
    }


    const finding = await this.prisma.finding.findFirst({
      where: {
        id: param.findingId
      },
      include: {
        ...query,
        subProject: {
          include: {
            project: {
              include: {
                members: true,
              }
            }
          }
        }
      }
    })

    if (!finding) {
      throw notfound
    }
    const members = finding.subProject.project.members
    const findMember = members.find((e) => e.userId === param.userId)
    if (!findMember) {
      throw unauthorized
    }
    return {
      user, finding
    }
  }

}
