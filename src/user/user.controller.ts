import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserCreateDto } from './dtos/user.create.dto';
import { UserLoginDto } from './dtos/user.login.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/auth/strategy';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() user: UserCreateDto) {
    const newUser = await this.userService.create(user);

    const { password, deleted_at, ...res } = newUser;
    return res;
  }

  @Post('login')
  async login(@Body() user: UserLoginDto) {
    return this.userService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }
}
