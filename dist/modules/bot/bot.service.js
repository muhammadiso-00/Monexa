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
var BotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const telegraf_1 = require("telegraf");
const user_service_1 = require("../auth/user.service");
const wallet_service_1 = require("../wallets/wallet.service");
const transfers_service_1 = require("../transfers/transfers.service");
const payments_service_1 = require("../payments/payments.service");
let BotService = BotService_1 = class BotService {
    configService;
    userService;
    walletService;
    transfersService;
    paymentsService;
    bot;
    logger = new common_1.Logger(BotService_1.name);
    constructor(configService, userService, walletService, transfersService, paymentsService) {
        this.configService = configService;
        this.userService = userService;
        this.walletService = walletService;
        this.transfersService = transfersService;
        this.paymentsService = paymentsService;
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!token) {
            this.logger.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
            return;
        }
        this.bot = new telegraf_1.Telegraf(token);
    }
    onModuleInit() {
        if (!this.bot)
            return;
        this.registerCommands();
        this.bot.launch().then(() => this.logger.log('Telegram Bot successfully launched'));
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
    registerCommands() {
        this.bot.start(async (ctx) => {
            const from = ctx.from;
            if (!from)
                return;
            try {
                const user = await this.userService.findOrCreateByTelegramId(from.id, `${from.first_name || ''} ${from.last_name || ''}`.trim(), from.username);
                ctx.reply(`Welcome to Monexa Bank, ${user.name}! 🏦\nYour account is ready.\nUse /help to see available commands.`);
            }
            catch (e) {
                ctx.reply(`Error connecting account: ${e.message}`);
            }
        });
        this.bot.command('balance', async (ctx) => {
            if (!ctx.from)
                return;
            try {
                const user = await this.userService.findByTelegramId(ctx.from.id);
                if (!user)
                    return ctx.reply('Please run /start first.');
                const bal = await this.walletService.getBalance(user.id);
                ctx.reply(`💰 **Your Balance:**\nAvailable: ${(0, wallet_service_1.formatMnx)(bal.available)}\nHeld: ${(0, wallet_service_1.formatMnx)(bal.held)}\nTotal: ${(0, wallet_service_1.formatMnx)(bal.total)}`, { parse_mode: 'Markdown' });
            }
            catch (e) {
                ctx.reply(`Error: ${e.message}`);
            }
        });
        this.bot.command('me', async (ctx) => {
            if (!ctx.from)
                return;
            const user = await this.userService.findByTelegramId(ctx.from.id);
            if (!user)
                return ctx.reply('Please run /start first.');
            ctx.reply(`👤 **Account Info**\nName: ${user.name}\nUsername: @${user.username || 'none'}\nUser ID: \`${user.id}\``, { parse_mode: 'Markdown' });
        });
        this.bot.command('deposit', async (ctx) => {
            if (!ctx.from)
                return;
            const parts = ctx.message.text.split(' ');
            if (parts.length < 2)
                return ctx.reply('Usage: /deposit <amount_in_mnx>');
            const amountMnx = parseFloat(parts[1]);
            if (isNaN(amountMnx) || amountMnx <= 0)
                return ctx.reply('Invalid amount.');
            try {
                const user = await this.userService.findByTelegramId(ctx.from.id);
                if (!user)
                    return ctx.reply('Run /start first.');
                const cents = Math.round(amountMnx * 100);
                await this.walletService.adminDeposit(user.id, cents);
                ctx.reply(`✅ Deposited ${(0, wallet_service_1.formatMnx)(cents)} to your account.`);
            }
            catch (e) {
                ctx.reply(`Failed to deposit: ${e.message}`);
            }
        });
        this.bot.command('send', async (ctx) => {
            if (!ctx.from)
                return;
            const parts = ctx.message.text.split(' ');
            if (parts.length < 3)
                return ctx.reply('Usage: /send @username <amount>');
            let targetUsername = parts[1].replace('@', '');
            const amountMnx = parseFloat(parts[2]);
            if (isNaN(amountMnx) || amountMnx <= 0)
                return ctx.reply('Invalid amount.');
            try {
                const fromUser = await this.userService.findByTelegramId(ctx.from.id);
                const toUser = await this.userService.findByUsername(targetUsername);
                if (!fromUser)
                    return ctx.reply('You need to run /start first.');
                if (!toUser)
                    return ctx.reply(`User @${targetUsername} not found in Monexa ecosystem.`);
                const cents = Math.round(amountMnx * 100);
                await this.transfersService.transferMnx(fromUser, toUser, cents);
                ctx.reply(`💸 Successfully sent ${(0, wallet_service_1.formatMnx)(cents)} to @${targetUsername}.`);
                this.bot.telegram.sendMessage(toUser.telegram_id, `📥 You received ${(0, wallet_service_1.formatMnx)(cents)} from @${fromUser.username || fromUser.name}.`);
            }
            catch (e) {
                ctx.reply(`Transfer failed: ${e.message}`);
            }
        });
        this.bot.command('history', async (ctx) => {
            if (!ctx.from)
                return;
            try {
                const user = await this.userService.findByTelegramId(ctx.from.id);
                if (!user)
                    return ctx.reply('Run /start first.');
                const history = await this.paymentsService.getHistory(user.id, 5);
                if (history.length === 0)
                    return ctx.reply('No recent transactions.');
                const msg = history.map(h => {
                    const sign = h.direction === 'credit' ? '+' : '-';
                    return `[${h.date.toISOString().split('T')[0]}] ${sign}${(0, wallet_service_1.formatMnx)(h.amount)} (${h.type})`;
                }).join('\n');
                ctx.reply(`📜 **Recent Transactions**\n\n${msg}`, { parse_mode: 'Markdown' });
            }
            catch (e) {
                ctx.reply(`Error fetching history: ${e.message}`);
            }
        });
        this.bot.help((ctx) => {
            ctx.reply(`🏦 **Monexa Bot Commands:**\n` +
                `/start - Register and open account\n` +
                `/balance - View your MNX balance\n` +
                `/me - Get your account details\n` +
                `/deposit <amount> - Add funds (Demo mode)\n` +
                `/send <@username> <amount> - Transfer MNX to another user\n` +
                `/history - View last 5 transactions`, { parse_mode: 'Markdown' });
        });
    }
};
exports.BotService = BotService;
exports.BotService = BotService = BotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_service_1.UserService,
        wallet_service_1.WalletService,
        transfers_service_1.TransfersService,
        payments_service_1.PaymentsService])
], BotService);
//# sourceMappingURL=bot.service.js.map