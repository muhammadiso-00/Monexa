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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const ledger_service_1 = require("../ledger/ledger.service");
const ledger_account_entity_1 = require("../ledger/entities/ledger-account.entity");
const ledger_entry_entity_1 = require("../ledger/entities/ledger-entry.entity");
const ledger_journal_entity_1 = require("../ledger/entities/ledger-journal.entity");
const wallet_service_1 = require("../wallets/wallet.service");
let TransfersService = class TransfersService {
    ledgerService;
    walletService;
    constructor(ledgerService, walletService) {
        this.ledgerService = ledgerService;
        this.walletService = walletService;
    }
    async transferMnx(fromUser, toUser, amountCents) {
        if (amountCents <= 0) {
            throw new common_1.BadRequestException('Transfer amount must be greater than zero');
        }
        if (fromUser.id === toUser.id) {
            throw new common_1.BadRequestException('Cannot transfer to yourself');
        }
        await this.walletService.getOrCreate(fromUser.id, 'user');
        await this.walletService.getOrCreate(toUser.id, 'user');
        const fromAccount = await this.ledgerService.findOrCreateAccount(fromUser.id, 'user', ledger_account_entity_1.LedgerAccountType.LIABILITY, wallet_service_1.MNX_CURRENCY);
        const toAccount = await this.ledgerService.findOrCreateAccount(toUser.id, 'user', ledger_account_entity_1.LedgerAccountType.LIABILITY, wallet_service_1.MNX_CURRENCY);
        await this.ledgerService.recordJournal(ledger_journal_entity_1.TransactionType.PAYMENT, [
            { accountId: fromAccount.id, direction: ledger_entry_entity_1.EntryDirection.DEBIT, amount: amountCents },
            { accountId: toAccount.id, direction: ledger_entry_entity_1.EntryDirection.CREDIT, amount: amountCents },
        ], `P2P Transfer of ${(0, wallet_service_1.formatMnx)(amountCents)} from user ${fromUser.id} to user ${toUser.id}`);
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        wallet_service_1.WalletService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map