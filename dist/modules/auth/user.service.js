"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UserService = class UserService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findOrCreateByTelegramId(telegramId, name, username) {
        let user = await this.userRepo.findOne({ where: { telegram_id: telegramId } });
        if (!user) {
            user = new user_entity_1.User();
            user.telegram_id = telegramId;
            user.name = name;
            if (username)
                user.username = username;
            user.email = `tg_${telegramId}@monexa.local`;
            await this.userRepo.save(user);
        }
        return user;
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return user;
    }
    async findByUsername(username) {
        return this.userRepo.findOne({ where: { username } });
    }
    async findByTelegramId(telegramId) {
        return this.userRepo.findOne({ where: { telegram_id: telegramId } });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map