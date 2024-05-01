import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/utils/exception/api.exception';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChats(subprojectId: number) {
    return this.prisma.chat.findMany({
      where: {
        ChatRoom: {
          SubProject: {
            some: {
              id: subprojectId,
            },
          },
        },
      },
      include: {
        sender: true,
        replyChat: true,
      },
    });
  }

  async insertChat(param: {
    senderId: number;
    replyChatId?: number;
    content: string;
    subprojectId: number;
  }) {
    const subproject = await this.prisma.subProject.findUnique({
      where: {
        id: param.subprojectId,
      },
    });
    if (!subproject || !subproject.chatRoomId) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'chat_room_not_found');
    }
    let data: Prisma.ChatCreateInput = {
      content: param.content,
      sender: {
        connect: {
          id: param.senderId,
        },
      },
      ChatRoom: {
        connect: {
          id: subproject.chatRoomId,
        },
      },
    };
    if (param.replyChatId) {
      data.replyChat = {
        connect: {
          id: param.replyChatId,
        },
      };
    }
    return this.prisma.chat.create({
      data: data,
    });
  }
}
