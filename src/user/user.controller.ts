import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { EditUserDto } from './dto/editUser.dto';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  async getUserById(@Param('userId') id: string) {
    const user = await this.userService.findOne(+id);
    const profilePicture = user.profilePicture
      ? user.profilePicture.imagePath
      : null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: profilePicture,
    };
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Put('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        email: {
          type: 'string',
        },

        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {}))
  editUser(
    @Req() req: Request,
    @Body() editUserDto: EditUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user['sub'];

    return this.userService.updateUser(userId, editUserDto, file);
  }
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Delete('picture')
  remove(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.userService.deleteProfilePicture(userId);
  }
}
