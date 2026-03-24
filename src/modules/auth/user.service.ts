import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOrCreateByTelegramId(
    telegramId: number,
    name: string,
    username?: string,
  ): Promise<User> {
    let user = await this.userRepo.findOne({ where: { telegram_id: telegramId } });
    if (!user) {
      user = new User();
      user.telegram_id = telegramId;
      user.name = name;
      if (username) user.username = username;
      user.email = `tg_${telegramId}@monexa.local`;
      await this.userRepo.save(user);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { telegram_id: telegramId } });
  }
}
