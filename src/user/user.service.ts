import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { UserLoginDto } from './dtos/user.login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'src/common/jwt/payload';
import { UserCreateDto } from './dtos/user.create.dto';
import 'dotenv/config';
import { dataSource } from 'ormconfig';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.userRepo.findOneBy({ id });
  }

  async create(newUser: UserCreateDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: newUser.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash the password and create salt
    newUser.password = await bcrypt.hash(newUser.password, 10);

    return this.userRepo.save(newUser);
  }

  async login(userData: UserLoginDto): Promise<string> {
    const user = await this.userRepo.findOne({
      where: {
        email: userData.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      userData.password,
      user.password,
    );

    const payload: JwtPayload = {
      id: user.id,
    };

    if (isPasswordValid) {
      return this.jwtService.sign(payload);
    }

    throw new UnauthorizedException('login failed');
  }
}

