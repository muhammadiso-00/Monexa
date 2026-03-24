import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../auth/user.service';
import { WalletService } from '../wallets/wallet.service';
import { TransfersService } from '../transfers/transfers.service';
import { PaymentsService } from '../payments/payments.service';
export declare class BotService implements OnModuleInit {
    private readonly configService;
    private readonly userService;
    private readonly walletService;
    private readonly transfersService;
    private readonly paymentsService;
    private bot;
    private readonly logger;
    constructor(configService: ConfigService, userService: UserService, walletService: WalletService, transfersService: TransfersService, paymentsService: PaymentsService);
    onModuleInit(): void;
    private registerCommands;
}
