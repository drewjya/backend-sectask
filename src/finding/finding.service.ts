import { Injectable } from '@nestjs/common';
import { DocType, ProjectRole } from '@prisma/client';
import { ProjectQuery } from 'src/common/query/project.query';
import { uuid } from 'src/common/uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { noaccess, notfound, unauthorized } from 'src/utils/exception/common.exception';
import { unlinkFile } from 'src/utils/pipe/file.pipe';
import { basicCvss } from './finding.enum';

@Injectable()
export class FindingService {
  private projectQuery: ProjectQuery;
  constructor(private prisma: PrismaService) {
    this.projectQuery = new ProjectQuery(prisma);
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
      const wrapper1 = await this.prisma.documentWrapper.create({
        data:
        {
          type: "DESCRIPTION",
          document: {
            create: {
              data: Buffer.from(''),
              id: uuid(),
            }
          },

          finding: {
            connect: {
              id: newFinding.id,
            }
          }
        }
      })
      const wrapper2 = await this.prisma.documentWrapper.create({
        data:
        {
          type: "THREAT",
          finding: {
            connect: {
              id: newFinding.id,
            }
          },
          document: {
            create: {
              data: Buffer.from(''),
              id: uuid(),
            }
          }
        }
      })

      return await this.prisma.finding.findFirst({
        where: {
          id: newFinding.id,
        },
        include: {
          document: {
            select: {
              document: {
                select: {
                  id: true,
                },
              },
              type: true,
              findingId: true,
            }
          },
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

    const description = newFind.document.find((e) => e.type === DocType.DESCRIPTION)
    const threat = newFind.document.find((e) => e.type === DocType.THREAT)
    delete newFind.document
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

        document: {
          select: {
            document: {
              select: {
                id: true,
              },
            },
            type: true,
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
    const description = finding.document.find((e) => e.type === DocType.DESCRIPTION)
    const threat = finding.document.find((e) => e.type === DocType.THREAT)
    delete finding.document


    return {
      ...finding,
      isEditor: isEditor ? true : false,
      descriptionId: description.document.id,
      threatAndRiskId: threat.document.id
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

  async editCVSS(param: {
    cvss: {
      AV: string;
      AC: string;
      AT: string;
      PR: string;
      UI: string;
      VC: string;
      VI: string;
      VA: string;
      SC: string;
      SI: string;
      SA: string;
      S: string;
      AU: string;
      R: string;
      V: string;
      RE: string;
      U: string;
      MAV: string;
      MAC: string;
      MAT: string;
      MPR: string;
      MUI: string;
      MVC: string;
      MVI: string;
      MVA: string;
      MSC: string;
      MSI: string;
      MSA: string;
      CR: string;
      IR: string;
      AR: string;
      E: string;
    };
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

  private async authorizedEditor(param: {
    userId: number;
    subprojectId: number;
    includePm?: boolean;
  }) {
    if (param.includePm === true) {
      const subproject = await this.prisma.subProject.findFirst({
        where: {
          id: param.subprojectId,
        },
        include: {
          project: {
            select: {
              members: {
                select: {
                  userId: true,
                  role: true,
                },
              },
            },
          },
        },
      });
      if (!subproject) {
        throw noaccess;
      }
      const member = subproject.project.members.find(
        (member) => member.userId === param.userId,
      );
      if (!member) {
        throw noaccess;
      }
      if (member.role === ProjectRole.PM) {
        return;
      } else {
        throw noaccess;
      }
    } else {
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
    const chatrooms = this.prisma.chatRoom.findMany({
      where: {
        findingId: finding.id,
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
    console.log(finding);

    if (!finding) {
      throw notfound
    }
    const members = finding.subProject.project.members
    const findMember = members.find((e) => e.userId === param.userId)
    if (!findMember) {
      throw unauthorized
    }
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
      }
    })

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
    const newChat = this.prisma.chat.create({
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

    })
    return newChat
  }


  async searchRoomChat(param: {
    userId: number;
    findingId: number;
    name: string;
  }) {
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
    return this.prisma.chatRoom.findFirst({
      where: {
        id: param.chatRoomId,
      },
      include: {
        chats: {
          take: 20,
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


}
