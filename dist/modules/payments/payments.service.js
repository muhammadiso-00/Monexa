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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_intent_entity_1 = require("./entities/payment-intent.entity");
const payment_attempt_entity_1 = require("./entities/payment-attempt.entity");
const ledger_service_1 = require("../ledger/ledger.service");
const ledger_account_entity_1 = require("../ledger/entities/ledger-account.entity");
const ledger_entry_entity_1 = require("../ledger/entities/ledger-entry.entity");
const ledger_journal_entity_1 = require("../ledger/entities/ledger-journal.entity");
const wallet_service_1 = require("../wallets/wallet.service");
const idempotency_key_entity_1 = require("../../shared/idempotency/idempotency-key.entity");
let PaymentsService = class PaymentsService {
    intentRepo;
    attemptRepo;
    idempRepo;
    journalRepo;
    ledgerService;
    walletService;
    constructor(intentRepo, attemptRepo, idempRepo, journalRepo, ledgerService, walletService) {
        this.intentRepo = intentRepo;
        this.attemptRepo = attemptRepo;
        this.idempRepo = idempRepo;
        this.journalRepo = journalRepo;
        this.ledgerService = ledgerService;
        this.walletService = walletService;
    }
    async createPay(fromUserId, toMerchantOrUserId, amountCents, idempotencyKeyStr) {
        let idemp = await this.idempRepo.findOne({ where: { key: idempotencyKeyStr } });
        if (idemp && idemp.status === 'completed') {
            return this.intentRepo.findOne({ where: { id: idemp.response_payload.intentId } });
        }
        if (!idemp) {
            idemp = this.idempRepo.create({ key: idempotencyKeyStr, status: 'started' });
            await this.idempRepo.save(idemp);
        }
        const intent = this.intentRepo.create({
            amount: amountCents,
            currency: wallet_service_1.MNX_CURRENCY,
            customer_id: fromUserId,
            merchant_id: toMerchantOrUserId,
            status: payment_intent_entity_1.PaymentStatus.PENDING,
        });
        await this.intentRepo.save(intent);
        const attempt = this.attemptRepo.create({
            payment_intent: intent,
            idempotency_key: idempotencyKeyStr,
            status: payment_attempt_entity_1.AttemptStatus.PROCESSING,
        });
        await this.attemptRepo.save(attempt);
        try {
            await this.walletService.getOrCreate(fromUserId, 'user');
            await this.walletService.getOrCreate(toMerchantOrUserId, 'merchant');
            const fromAccount = await this.ledgerService.findOrCreateAccount(fromUserId, 'user', ledger_account_entity_1.LedgerAccountType.LIABILITY, wallet_service_1.MNX_CURRENCY);
            const toAccount = await this.ledgerService.findOrCreateAccount(toMerchantOrUserId, 'merchant', ledger_account_entity_1.LedgerAccountType.LIABILITY, wallet_service_1.MNX_CURRENCY);
            await this.ledgerService.recordJournal(ledger_journal_entity_1.TransactionType.PAYMENT, [
                { accountId: fromAccount.id, direction: ledger_entry_entity_1.EntryDirection.DEBIT, amount: amountCents },
                { accountId: toAccount.id, direction: ledger_entry_entity_1.EntryDirection.CREDIT, amount: amountCents },
            ], `Payment ${intent.id}`);
            intent.status = payment_intent_entity_1.PaymentStatus.CAPTURED;
            attempt.status = payment_attempt_entity_1.AttemptStatus.SUCCEEDED;
        }
        catch (error) {
            intent.status = payment_intent_entity_1.PaymentStatus.FAILED;
            attempt.status = payment_attempt_entity_1.AttemptStatus.FAILED;
            attempt.error_message = error.message;
        }
        await this.intentRepo.save(intent);
        await this.attemptRepo.save(attempt);
        idemp.status = 'completed';
        idemp.response_payload = { intentId: intent.id };
        await this.idempRepo.save(idemp);
        return intent;
    }
    async getHistory(ownerId, limit = 10) {
        const qb = this.journalRepo.createQueryBuilder('journal')
            .leftJoinAndSelect('journal.entries', 'entry')
            .leftJoinAndSelect('entry.account', 'account')
            .where('account.owner_id = :ownerId', { ownerId })
            .orderBy('journal.created_at', 'DESC')
            .take(limit);
        const journals = await qb.getMany();
        return journals.map((j) => {
            const myEntry = j.entries.find((e) => e.account.owner_id === ownerId);
            const otherEntry = j.entries.find((e) => e.account.owner_id !== ownerId);
            return {
                id: j.id,
                type: j.transaction_type,
                amount: myEntry?.amount ?? 0,
                direction: myEntry?.direction,
                description: j.description,
                otherParty: otherEntry?.account.name,
                date: j.created_at,
            };
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_intent_entity_1.PaymentIntent)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_attempt_entity_1.PaymentAttempt)),
    __param(2, (0, typeorm_1.InjectRepository)(idempotency_key_entity_1.IdempotencyKey)),
    __param(3, (0, typeorm_1.InjectRepository)(ledger_journal_entity_1.LedgerJournal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ledger_service_1.LedgerService,
        wallet_service_1.WalletService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map