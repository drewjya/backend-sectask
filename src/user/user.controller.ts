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
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { EditUserDto } from './dto/editUser.dto';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @UseGuards(AccessTokenGuard)
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
  @Put('')
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
  @Delete('picture')
  remove(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.userService.deleteProfilePicture(userId);
  }
}
