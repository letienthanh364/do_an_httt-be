import { PickType } from '@nestjs/swagger';
import { User } from '../user.entity';

export class UserCreateDto extends PickType(User, [
  'name',
  'email',
  'password',
] as const) {}
