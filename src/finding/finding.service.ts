import { Injectable } from '@nestjs/common';
import { ProjectRole, User } from '@prisma/client';
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
    const newFind = await this.prisma.$transaction(async (tx) => {
      const newFinding = await this.prisma.finding.create({

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
              id: uuid(),
            }
          },
          threatAndRisk: {
            create: {
              data: Buffer.from(''),
              id: uuid(),
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
      });


      return await this.prisma.finding.findFirst({
        where: {
          id: newFinding.id,
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
              profilePicture: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  contentType: true,
                  imagePath: true,
                  createdAt: true,
                },
              },
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
      })
    })

    const description = newFind.description
    const threat = newFind.threatAndRisk
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

        description: true,
        threatAndRisk: true,
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



    return {
      ...finding,
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
          include: {
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
    return newFInding;
  }

  async editRetestProperties(param: {
    properties: {
      latestUpdate?: Date;
      // tester?: string;
      status?: string;
      releases?: string;
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
        latestUpdate: param.properties.latestUpdate,
        //TODO: tester: param.properties.tester,
        status: param.properties.status,
        releases: param.properties.releases,
      },
    });
    this.notifyEdit({ userId: param.userId, findingId: param.findingId });
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

      }
    })

    //TODO: ADD LOG
    //TODO: ADD EVENT
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
    console.log(finding);
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    return this.prisma.cvssDetail.update({
      where: {
        id: finding.cvssDetail.id,
      },
      data: {
        data: param.cvss,
      },
    });
  }

  async deleteFinding(param: { userId: number; findingId: number }) {
    const finding = await this.prisma.finding.findFirst({
      where: { id: param.findingId },
      select: {
        subProjectId: true,
      },
    });
    await this.authorizedEditor({
      subprojectId: finding.subProjectId,
      userId: param.userId,
    });
    return this.prisma.finding.delete({
      where: {
        id: param.findingId,
      },
    });
  }

  async uploadImageForTiptap(userId: number, file: Express.Multer.File, originalName?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      }
    })
    if (!user) {
      throw unauthorized
    }
    const uploadFile = await this.prisma.file.create({
      data: {
        contentType: file.mimetype,
        imagePath: file.path,
        name: file.filename,
        originalName: originalName
      }
    })
    return uploadFile;
  }

  async deleteImageTiptap(userId: number, name: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      }
    })
    if (!user) {
      throw unauthorized
    }
    const uploadFile = await this.prisma.file.findFirst({
      where: {
        name: name
      }
    })
    if (!uploadFile) {
      throw notfound
    }
    const deleteFile = await this.prisma.file.delete({
      where: {
        id: uploadFile.id
      }
    })
    unlinkFile(deleteFile.imagePath);
    return uploadFile;
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
