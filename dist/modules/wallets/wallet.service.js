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
exports.WalletService = exports.MNX_CURRENCY = void 0;
exports.toMnxCents = toMnxCents;
exports.formatMnx = formatMnx;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const ledger_service_1 = require("../ledger/ledger.service");
const ledger_account_entity_1 = require("../ledger/entities/ledger-account.entity");
const ledger_entry_entity_1 = require("../ledger/entities/ledger-entry.entity");
const ledger_journal_entity_1 = require("../ledger/entities/ledger-journal.entity");
exports.MNX_CURRENCY = 'MNX';
function toMnxCents(mnx) {
    return Math.round(mnx * 100);
}
function formatMnx(cents) {
    return `${(cents / 100).toFixed(2)} MNX`;
}
let WalletService = class WalletService {
    walletRepo;
    ledgerService;
    constructor(walletRepo, ledgerService) {
        this.walletRepo = walletRepo;
        this.ledgerService = ledgerService;
    }
    async getOrCreate(ownerId, ownerType) {
        let wallet = await this.walletRepo.findOne({
            where: { owner_id: ownerId, currency: exports.MNX_CURRENCY },
        });
        if (!wallet) {
            wallet = this.walletRepo.create({
                owner_id: ownerId,
                owner_type: ownerType,
                currency: exports.MNX_CURRENCY,
                available_balance: 0,
                held_balance: 0,
            });
            await this.walletRepo.save(wallet);
            await this.ledgerService.findOrCreateAccount(ownerId, ownerType, ledger_account_entity_1.LedgerAccountType.LIABILITY, exports.MNX_CURRENCY);
        }
        return wallet;
    }
    async getBalance(ownerId) {
        await this.getOrCreate(ownerId, 'user');
        const wallet = await this.walletRepo.findOne({
            where: { owner_id: ownerId, currency: exports.MNX_CURRENCY },
        });
        const available = wallet?.available_balance ?? 0;
        const held = wallet?.held_balance ?? 0;
        return { available, held, total: available + held };
    }
    async adminDeposit(userId, amountCents) {
        await this.getOrCreate(userId, 'user');
        const PLATFORM_ID = 'platform_treasury';
        let platformWallet = await this.walletRepo.findOne({
            where: { owner_id: PLATFORM_ID, currency: exports.MNX_CURRENCY },
        });
        if (!platformWallet) {
            platformWallet = this.walletRepo.create({
                owner_id: PLATFORM_ID,
                owner_type: 'system',
                currency: exports.MNX_CURRENCY,
                available_balance: 1_000_000_00,
                held_balance: 0,
            });
            await this.walletRepo.save(platformWallet);
        }
        const platformAccount = await this.ledgerService.findOrCreateAccount(PLATFORM_ID, 'system', ledger_account_entity_1.LedgerAccountType.ASSET, exports.MNX_CURRENCY);
        const userAccount = await this.ledgerService.findOrCreateAccount(userId, 'user', ledger_account_entity_1.LedgerAccountType.LIABILITY, exports.MNX_CURRENCY);
        await this.ledgerService.recordJournal(ledger_journal_entity_1.TransactionType.DEPOSIT, [
            { accountId: platformAccount.id, direction: ledger_entry_entity_1.EntryDirection.DEBIT, amount: amountCents },
            { accountId: userAccount.id, direction: ledger_entry_entity_1.EntryDirection.CREDIT, amount: amountCents },
        ], `Admin deposit of ${formatMnx(amountCents)} to user ${userId}`);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ledger_service_1.LedgerService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map