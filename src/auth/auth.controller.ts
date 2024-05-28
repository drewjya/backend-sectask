import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { RefreshTokenGuard } from 'src/common/guard/refresh-token.guard';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  EditProfileDto,
  LoginDto,
  RegisterDto,
} from './request/auth.request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('change_password')
  changePassword(@Body() body: ChangePasswordDto, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.authService.changePassword({
      ...body,
      userId: +userId,
    });
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.authService.refresh({
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Put('profile')
  editProfile(@Body() body: EditProfileDto, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.authService.editProfie({
      ...body,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post('picture')
  addPicture(
    @Req() req: Request,
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
  ) {
    const userId = extractUserId(req);
    return this.authService.changeProfileImage({
      userId: userId,
      file: file,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Delete('picture')
  deletePicture(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.authService.removeImagePath({
      userId: userId,
    });
  }
}
