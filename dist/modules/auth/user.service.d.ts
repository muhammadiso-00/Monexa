import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UserService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findOrCreateByTelegramId(telegramId: number, name: string, username?: string): Promise<User>;
    findById(id: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    findByTelegramId(telegramId: number): Promise<User | null>;
}
