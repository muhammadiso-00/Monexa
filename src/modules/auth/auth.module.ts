import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Merchant } from './entities/merchant.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Merchant])],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class AuthModule {}
