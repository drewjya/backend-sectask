import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { MessageService } from './message.service';

class MessageDTO {
  message: string;
}

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AccessTokenGuard)
  @Post('')
  sendMessage(@Req() req: Request, @Body() message: MessageDTO) {
    const userId = req.user['sub'];
    return this.messageService.createMessage(userId, message.message);
  }
}
