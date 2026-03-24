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
exports.LedgerJournal = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const ledger_entry_entity_1 = require("./ledger-entry.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["PAYMENT"] = "payment";
    TransactionType["REFUND"] = "refund";
    TransactionType["PAYOUT"] = "payout";
    TransactionType["FEE"] = "fee";
    TransactionType["HOLD"] = "hold";
    TransactionType["RELEASE"] = "release";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let LedgerJournal = class LedgerJournal {
    id;
    transaction_type;
    description;
    entries;
    created_at;
};
exports.LedgerJournal = LedgerJournal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerJournal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TransactionType }),
    __metadata("design:type", String)
], LedgerJournal.prototype, "transaction_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LedgerJournal.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ledger_entry_entity_1.LedgerEntry, (entry) => entry.journal, { cascade: true }),
    __metadata("design:type", Array)
], LedgerJournal.prototype, "entries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerJournal.prototype, "created_at", void 0);
exports.LedgerJournal = LedgerJournal = __decorate([
    (0, typeorm_1.Entity)('ledger_journals')
], LedgerJournal);
//# sourceMappingURL=ledger-journal.entity.js.map