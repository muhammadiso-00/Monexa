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
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ledger_account_entity_1 = require("./entities/ledger-account.entity");
const ledger_journal_entity_1 = require("./entities/ledger-journal.entity");
const ledger_entry_entity_1 = require("./entities/ledger-entry.entity");
const wallet_entity_1 = require("../wallets/entities/wallet.entity");
let LedgerService = LedgerService_1 = class LedgerService {
    dataSource;
    accountRepo;
    logger = new common_1.Logger(LedgerService_1.name);
    constructor(dataSource, accountRepo) {
        this.dataSource = dataSource;
        this.accountRepo = accountRepo;
    }
    async recordJournal(type, entries, description) {
        const totalCredits = entries
            .filter((e) => e.direction === ledger_entry_entity_1.EntryDirection.CREDIT)
            .reduce((s, e) => s + e.amount, 0);
        const totalDebits = entries
            .filter((e) => e.direction === ledger_entry_entity_1.EntryDirection.DEBIT)
            .reduce((s, e) => s + e.amount, 0);
        if (totalCredits !== totalDebits) {
            throw new common_1.BadRequestException(`Ledger imbalanced: credits=${totalCredits} debits=${totalDebits}`);
        }
        return this.dataSource.transaction(async (em) => {
            const accountIds = [...new Set(entries.map((e) => e.accountId))];
            const accounts = await em.find(ledger_account_entity_1.LedgerAccount, {
                where: accountIds.map((id) => ({ id })),
            });
            for (const account of accounts) {
                if (account.owner_id) {
                    await em
                        .getRepository(wallet_entity_1.Wallet)
                        .createQueryBuilder('wallet')
                        .setLock('pessimistic_write')
                        .where('wallet.owner_id = :ownerId AND wallet.currency = :currency', {
                        ownerId: account.owner_id,
                        currency: account.currency,
                    })
                        .getOne();
                }
            }
            for (const entry of entries.filter((e) => e.direction === ledger_entry_entity_1.EntryDirection.DEBIT)) {
                const account = accounts.find((a) => a.id === entry.accountId);
                if (!account)
                    throw new common_1.BadRequestException(`Account ${entry.accountId} not found`);
                if (account.type === ledger_account_entity_1.LedgerAccountType.LIABILITY) {
                    const wallet = await em
                        .getRepository(wallet_entity_1.Wallet)
                        .findOne({ where: { owner_id: account.owner_id, currency: account.currency } });
                    if (!wallet || wallet.available_balance < entry.amount) {
                        throw new common_1.BadRequestException(`Insufficient balance. Available: ${wallet?.available_balance ?? 0} mnx-cents, Needed: ${entry.amount}`);
                    }
                }
            }
            const journal = em.create(ledger_journal_entity_1.LedgerJournal, { transaction_type: type, description });
            await em.save(journal);
            const entryRecords = [];
            for (const e of entries) {
                const account = accounts.find((a) => a.id === e.accountId);
                const record = em.create(ledger_entry_entity_1.LedgerEntry, {
                    journal,
                    account,
                    amount: e.amount,
                    direction: e.direction,
                });
                entryRecords.push(record);
            }
            await em.save(entryRecords);
            for (const entry of entries) {
                const account = accounts.find((a) => a.id === entry.accountId);
                if (!account?.owner_id)
                    continue;
                const delta = entry.direction === ledger_entry_entity_1.EntryDirection.CREDIT ? entry.amount : -entry.amount;
                await em
                    .getRepository(wallet_entity_1.Wallet)
                    .createQueryBuilder()
                    .update()
                    .set({ available_balance: () => `available_balance + ${delta}` })
                    .where('owner_id = :ownerId AND currency = :currency', {
                    ownerId: account.owner_id,
                    currency: account.currency,
                })
                    .execute();
            }
            this.logger.log(`Journal recorded: type=${type} totalAmount=${totalCredits}`);
            return journal;
        });
    }
    async findOrCreateAccount(ownerId, ownerType, type, currency = 'MNX') {
        let account = await this.accountRepo.findOne({ where: { owner_id: ownerId, currency } });
        if (!account) {
            account = this.accountRepo.create({
                name: `${ownerType}:${ownerId}`,
                type,
                owner_id: ownerId,
                currency,
            });
            await this.accountRepo.save(account);
        }
        return account;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(ledger_account_entity_1.LedgerAccount)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map