import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { UserService } from '../auth/user.service';
import { WalletService, formatMnx } from '../wallets/wallet.service';
import { TransfersService } from '../transfers/transfers.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly transfersService: TransfersService,
    private readonly paymentsService: PaymentsService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
      return;
    }
    this.bot = new Telegraf(token);
  }

  onModuleInit() {
    if (!this.bot) return;

    this.registerCommands();
    this.bot.launch().then(() => this.logger.log('Telegram Bot successfully launched'));

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private mainMenu() {
    return Markup.keyboard([
      ['💰 Balance', '👤 Profile'],
      ['💸 Send money', '📜 History'],
      ['➕ Deposit', '❓ Help'],
    ]).resize();
  }

  private contactRequestKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('📞 Share phone')],
      ['❓ Help'],
    ]).resize().oneTime();
  }

  private registerCommands() {
    // 1. /start - Register User + phone capture if missing
    this.bot.start(async (ctx) => {
      const from = ctx.from;
      if (!from) return;

      try {
        const user = await this.userService.findOrCreateByTelegramId(
          from.id,
          `${from.first_name || ''} ${from.last_name || ''}`.trim(),
          from.username,
        );

        if (!user.phone) {
          await ctx.reply(
            `👋 Welcome to Monexa, ${user.name}!\n\n📱 To finish signup, please share your phone number.`,
            this.contactRequestKeyboard(),
          );
          return;
        }

        await ctx.reply(
          `🏦 Welcome back, ${user.name}!\nChoose an option below to continue.`,
          this.mainMenu(),
        );
      } catch (e: any) {
        ctx.reply(`❌ Error connecting account: ${e.message}`);
      }
    });

    // Contact handler for phone capture
    this.bot.on('contact', async (ctx) => {
      if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;
      const contact = ctx.message.contact;

      // Only accept contact from the same user
      if (!contact.user_id || contact.user_id !== ctx.from.id) {
        return ctx.reply('❌ Please use the button to share your own phone number.');
      }

      try {
        await this.userService.setPhoneForTelegramUser(ctx.from.id, contact.phone_number);
        await ctx.reply('✅ Phone number saved! Your account is ready.');
        await ctx.reply('Choose an option below to continue:', this.mainMenu());
      } catch (e: any) {
        ctx.reply(`❌ Could not save phone: ${e.message}`);
      }
    });

    // Button routes (fallback to slash commands remain)
    this.bot.hears('💰 Balance', async (ctx) => {
      if (!ctx.from) return;
      const user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) return ctx.reply('Please run /start first.');
      if (!user.phone) return ctx.reply('📱 Please share your phone first.', this.contactRequestKeyboard());
      const bal = await this.walletService.getBalance(user.id);
      ctx.reply(
        `💰 Your Balance\n` +
          `• Available: ${formatMnx(bal.available)}\n` +
          `• Held: ${formatMnx(bal.held)}\n` +
          `• Total: ${formatMnx(bal.total)}`,
      );
    });

    this.bot.hears('👤 Profile', async (ctx) => {
      if (!ctx.from) return;
      const user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) return ctx.reply('Please run /start first.');
      const phone = user.phone ? user.phone : 'not set';
      ctx.reply(
        `👤 Profile\n` +
          `• Name: ${user.name}\n` +
          `• Username: @${user.username || 'none'}\n` +
          `• Phone: ${phone}`,
      );
    });

    this.bot.hears('📜 History', async (ctx) => {
      if (!ctx.from) return;
      const user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) return ctx.reply('Run /start first.');
      const history = await this.paymentsService.getHistory(user.id, 5);
      if (history.length === 0) return ctx.reply('📭 No recent transactions.');
      const msg = history
        .map((h) => {
          const sign = h.direction === 'credit' ? '+' : '-';
          return `[${h.date.toISOString().split('T')[0]}] ${sign}${formatMnx(h.amount)} (${h.type})`;
        })
        .join('\n');
      ctx.reply(`📜 Recent Transactions\n\n${msg}`);
    });

    this.bot.hears('➕ Deposit', (ctx) => ctx.reply('Use /deposit <amount> (e.g., /deposit 10.50)'));
    this.bot.hears('❓ Help', (ctx) =>
      ctx.reply(
        `🏦 Monexa Bot\n` +
          `• 💰 Balance — check your funds\n` +
          `• 👤 Profile — your account details\n` +
          `• 💸 Send money — transfer to a user\n` +
          `• 📜 History — last transactions\n\n` +
          `Slash commands still work: /start /balance /me /deposit /send /history`,
      ),
    );

    // 2. /balance - Check MNX Balance (kept)
    this.bot.command('balance', async (ctx) => {
      if (!ctx.from) return;
      try {
        const user = await this.userService.findByTelegramId(ctx.from.id);
        if (!user) return ctx.reply('Please run /start first.');
        if (!user.phone) return ctx.reply('📱 Please share your phone first.', this.contactRequestKeyboard());
        const bal = await this.walletService.getBalance(user.id);
        ctx.reply(`💰 **Your Balance:**\nAvailable: ${formatMnx(bal.available)}\nHeld: ${formatMnx(bal.held)}\nTotal: ${formatMnx(bal.total)}`, { parse_mode: 'Markdown' });
      } catch (e: any) {
        ctx.reply(`Error: ${e.message}`);
      }
    });

    // 3. /me - Account Info (kept)
    this.bot.command('me', async (ctx) => {
      if (!ctx.from) return;
      const user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) return ctx.reply('Please run /start first.');
      const phone = user.phone ? user.phone : 'not set';
      ctx.reply(`👤 **Account Info**\nName: ${user.name}\nUsername: @${user.username || 'none'}\nPhone: ${phone}\nUser ID: \`${user.id}\``, { parse_mode: 'Markdown' });
    });

    // 4. /deposit <amount> - Admin Top-up (kept)
    this.bot.command('deposit', async (ctx) => {
      if (!ctx.from) return;
      const parts = ctx.message.text.split(' ');
      if (parts.length < 2) return ctx.reply('Usage: /deposit <amount_in_mnx>');

      const amountMnx = parseFloat(parts[1]);
      if (isNaN(amountMnx) || amountMnx <= 0) return ctx.reply('Invalid amount.');

      try {
        const user = await this.userService.findByTelegramId(ctx.from.id);
        if (!user) return ctx.reply('Run /start first.');

        const cents = Math.round(amountMnx * 100);
        await this.walletService.adminDeposit(user.id, cents);

        ctx.reply(`✅ Deposited ${formatMnx(cents)} to your account.`);
      } catch (e: any) {
        ctx.reply(`Failed to deposit: ${e.message}`);
      }
    });

    // 5. /send @username <amount> - P2P Transfer (kept)
    this.bot.command('send', async (ctx) => {
      if (!ctx.from) return;
      const parts = ctx.message.text.split(' ');
      if (parts.length < 3) return ctx.reply('Usage: /send @username <amount>');

      let targetUsername = parts[1].replace('@', '');
      const amountMnx = parseFloat(parts[2]);

      if (isNaN(amountMnx) || amountMnx <= 0) return ctx.reply('Invalid amount.');

      try {
        const fromUser = await this.userService.findByTelegramId(ctx.from.id);
        const toUser = await this.userService.findByUsername(targetUsername);

        if (!fromUser) return ctx.reply('You need to run /start first.');
        if (!toUser) return ctx.reply(`User @${targetUsername} not found in Monexa ecosystem.`);

        const cents = Math.round(amountMnx * 100);
        await this.transfersService.transferMnx(fromUser, toUser, cents);

        ctx.reply(`💸 Successfully sent ${formatMnx(cents)} to @${targetUsername}.`);
        this.bot.telegram.sendMessage(
          toUser.telegram_id,
          `📥 You received ${formatMnx(cents)} from @${fromUser.username || fromUser.name}.`,
        );
      } catch (e: any) {
        ctx.reply(`Transfer failed: ${e.message}`);
      }
    });

    // 6. /history - Transaction Log (kept)
    this.bot.command('history', async (ctx) => {
      if (!ctx.from) return;
      try {
        const user = await this.userService.findByTelegramId(ctx.from.id);
        if (!user) return ctx.reply('Run /start first.');

        const history = await this.paymentsService.getHistory(user.id, 5);
        if (history.length === 0) return ctx.reply('No recent transactions.');

        const msg = history
          .map((h) => {
            const sign = h.direction === 'credit' ? '+' : '-';
            return `[${h.date.toISOString().split('T')[0]}] ${sign}${formatMnx(h.amount)} (${h.type})`;
          })
          .join('\n');

        ctx.reply(`📜 **Recent Transactions**\n\n${msg}`, { parse_mode: 'Markdown' });
      } catch (e: any) {
        ctx.reply(`Error fetching history: ${e.message}`);
      }
    });

    // 7. /help (kept)
    this.bot.help((ctx) => {
      ctx.reply(
        `🏦 **Monexa Bot Commands:**\n` +
          `/start - Register and open account\n` +
          `/balance - View your MNX balance\n` +
          `/me - Get your account details\n` +
          `/deposit <amount> - Add funds (Demo mode)\n` +
          `/send <@username> <amount> - Transfer MNX to another user\n` +
          `/history - View last 5 transactions`,
        { parse_mode: 'Markdown' },
      );
    });
  }
}
