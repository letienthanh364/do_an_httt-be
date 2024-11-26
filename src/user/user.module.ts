import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../common/auth/strategy';
import { dataSource } from 'ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSource.options,
      name: 'defaultConnection',
    }),
    TypeOrmModule.forFeature([User], 'defaultConnection'), // Specify the connection name here
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '365d' },
    }),
  ],
  providers: [UserService, LocalStrategy],
  controllers: [UserController],
  exports: [UserService], // Export UserService if used in other modules
})
export class UserModule {}
