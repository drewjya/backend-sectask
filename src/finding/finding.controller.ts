import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { SubprojectFindingDto } from 'src/subproject/entity/subproject.entity';
import { FindingEventHeader } from 'src/types/header';
import { EventSidebarFinding } from 'src/types/sidebar';
import { FINDING_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import {
  CreateTestingDto,
  EditCVSSProp,
  EditFProp,
  EditFindingDto,

  NewChatDto,
  NewChatRoomDto,
} from './dto/create-finding.dto';
import { FindingService } from './finding.service';

@Controller('finding')
export class FindingController {
  constructor(
    private readonly findingService: FindingService,
    private readonly emitter: EventEmitter2,
  ) { }

  @UseGuards(AccessTokenGuard)
  @Post('new/:subprojectId')
  async create(
    @Param('subprojectId') subprojectId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const finding = await this.findingService.create({
      subprojectId: +subprojectId,
      userId: userId,
    });
    const newFinding: SubprojectFindingDto = {
      finding: {
        findingId: finding.id,
        name: finding.name,
        owner: {
          id: finding.createdBy.id,
          name: finding.createdBy.name,
          profilePicture: finding.createdBy.profilePicture,
        },
      },
      subprojectId: finding.subProject.id,
      type: 'add',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.FINDING, newFinding);

    const newSidebarItem: EventSidebarFinding = {
      finding: {
        findingId: finding.id,
        name: finding.name,
      },
      userId: finding.subProject.project.members.map((member) => member.userId),
      projectId: finding.subProject.project.id,
      subprojectId: finding.subProject.id,
      type: 'add',
    };
    this.emitter.emit(FINDING_ON_MESSAGE.SIDEBAR, newSidebarItem);
  }

  @UseGuards(AccessTokenGuard)
  @Post('notify/:id')
  notifyEdit(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.notifyEdit({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('edit/:id')
  async editFinding(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFindingDto,
  ) {
    const userId = extractUserId(req);
    const finding = await this.findingService.editFinding({
      findingId: +id,
      userId: userId,
      properties: param,
    });
    const newFinding: SubprojectFindingDto = {
      finding: {
        findingId: finding.id,
        name: finding.name,
        owner: {
          id: finding.createdBy.id,
          name: finding.createdBy.name,
          profilePicture: finding.createdBy.profilePicture,
        },
      },
      subprojectId: finding.subProject.id,
      type: 'edit',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.FINDING, newFinding);
    const newSidebarItem: EventSidebarFinding = {
      finding: {
        findingId: finding.id,
        name: finding.name,
      },
      userId: finding.subProject.project.members.map((member) => member.userId),
      projectId: finding.subProject.project.id,
      subprojectId: finding.subProject.id,
      type: 'edit',
    };
    this.emitter.emit(FINDING_ON_MESSAGE.SIDEBAR, newSidebarItem);

    const findingHeader: FindingEventHeader = {
      findingId: finding.id,
      name: finding.name,
    };

    this.emitter.emit(FINDING_ON_MESSAGE.HEADER, findingHeader);
  }

  @UseGuards(AccessTokenGuard)
  @Post('fprop/:id')
  editFindingProp(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editFindingProperties({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get('retest/:id')
  getTestHistory(
    @Param('id') id: string,
    @Req() req: Request,

  ) {
    const userId = extractUserId(req);
    return this.findingService.getRetestList({
      userId: userId,
      findingId: +id,
    })
  }

  @UseGuards(AccessTokenGuard)
  @Post('retest/:id')
  createTest(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: CreateTestingDto,
  ) {
    const userId = extractUserId(req);
    return this.findingService.createRetest({
      userId: userId,
      content: param.content,
      findingId: +id,
      status: param.status,
      version: param.version
    })
  }

  @UseGuards(AccessTokenGuard)
  @Get('retest/:id/:testId')
  getRetestDetail(
    @Param('id') id: string,
    @Param('testId') testId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    return this.findingService.getRetestDetail({
      userId: userId,
      findingId: +id,
      retestId: +testId
    })
  }

  @UseGuards(AccessTokenGuard)
  @Post('cvss/:id')
  async editCVSS(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditCVSSProp,
  ) {
    const userId = extractUserId(req);
    const cvss = await this.findingService.editCVSS({
      findingId: +id,
      userId: userId,
      cvss: param,
    });

    return cvss
  }

  @UseGuards(AccessTokenGuard)
  @Post('upload/delete/:name')
  async deleteFile(
    @Req() req: Request,
    @Param("name") name: string,
    @Query('id') imageId: string,
    @Query('findingId') findingId: string
  ) {
    const userId = extractUserId(req)

    return this.findingService.deleteImageTiptap({
      userId, name,
      fileId: +imageId,
      findingId: +findingId
    })
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post('upload/:findingId')
  async uploadImage(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: Request,
    @Param('findingId') findingId: string
  ) {
    const userId = extractUserId(req)
    const originalName = req.body.originalName;

    return this.findingService.uploadImageForTiptap({
      userId: userId,
      file,
      originalName,
      findingId: +findingId
    })
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.deleteFinding({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.findDetail({
      findingId: +id,
      userId: userId,
    });
  }


  @UseGuards(AccessTokenGuard)
  @Get(':id/discussions')
  async getDiscussion(@Req() req: Request, @Param('id') findingId: string, @Query('query') query: string) {
    const userId = extractUserId(req)
    if (query && query.length > 0) {
      return this.findingService.searchRoomChat({ userId, findingId: +findingId, name: query })
    } else {
      return this.findingService.getAllChatRoom({
        userId: userId,
        findingId: +findingId
      })
    }
  }

  @UseGuards(AccessTokenGuard)
  @Post(":id/discussions")
  async postDiscussion(@Req() req: Request, @Param('id') findingId: string, @Body() param: NewChatRoomDto) {
    const userId = extractUserId(req)
    console.log(userId);

    return this.findingService.createRoomChat({
      findingId: +findingId,
      userId: userId,
      title: param.title
    })
  }

  @UseGuards(AccessTokenGuard)
  @Get(":id/chats/:roomId")
  async getChats(@Req() req: Request, @Param('id') findingId: string, @Param('roomId') roomId: string) {
    const userId = extractUserId(req)
    return this.findingService.getRoomChatDetail({
      chatRoomId: +roomId,
      findingId: +findingId,
      userId: +userId
    })
  }


  @UseGuards(AccessTokenGuard)
  @Post(":id/chats/:roomId")
  async postChats(@Req() req: Request, @Param('id') findingId: string, @Param('roomId') roomId: string, @Body() param: NewChatDto) {
    const userId = extractUserId(req)
    return this.findingService.createChats({
      findingId: +findingId,
      userId: userId,
      chatroomId: +roomId,
      value: param.content,
      replyChatId: param.replyChatId
    })
  }

}
