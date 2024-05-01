import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { ApiException } from 'src/utils/exception/api.exception';
import { ChatService } from './chat.service';
import { InsertChatDto } from './dto/createChat.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AccessTokenGuard)
  @Post(':subprojectId')
  postChat(
    @Req() req: Request,
    @Body() param: InsertChatDto,
    @Param('subprojectId') subproejctId: string,
  ) {
    const userId = req.user['sub'];
    if (!Number(subproejctId)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'wrong_subproject_parameter',
      );
    }
    return this.chatService.insertChat({
      content: param.content,
      senderId: userId,
      subprojectId: +subproejctId,
      replyChatId: param.replyChatId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':subprojectId')
  getChat(@Req() req: Request, @Param('subprojectId') subproejctId: string) {
    const userId = req.user['sub'];
    if (!Number(subproejctId)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'wrong_subproject_parameter',
      );
    }
    return this.chatService.getChats(+subproejctId);
  }
}
