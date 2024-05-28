import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenGuard } from 'src/common/guard/refresh-token.guard';
import { extractUserId } from 'src/utils/extract/userId';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
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
    return this.authService.refresh(userId);
  }

  
}
