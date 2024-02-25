import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guards';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  @Post('register')
  registter(@Body() register: RegisterDto) {
    return this.authService.register(register);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() req:Request) {
    const userId = req.user['sub'];
    
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout() {
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Post('change_password')
  changePassword() {
    return;
  }
}
