import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  findOne(@Param('userId') id: string) {
    return this.userService.findOne(+id);
  }

  @Put('')
  update(@Body() updateUserDto: UpdateUserDto) {
    return;
  }

  @Delete('picture')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
