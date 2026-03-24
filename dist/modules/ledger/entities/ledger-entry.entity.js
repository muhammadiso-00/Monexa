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
exports.LedgerEntry = exports.EntryDirection = void 0;
const typeorm_1 = require("typeorm");
const ledger_journal_entity_1 = require("./ledger-journal.entity");
const ledger_account_entity_1 = require("./ledger-account.entity");
var EntryDirection;
(function (EntryDirection) {
    EntryDirection["CREDIT"] = "credit";
    EntryDirection["DEBIT"] = "debit";
})(EntryDirection || (exports.EntryDirection = EntryDirection = {}));
let LedgerEntry = class LedgerEntry {
    id;
    journal;
    account;
    amount;
    direction;
    created_at;
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_journal_entity_1.LedgerJournal, (journal) => journal.entries, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'journal_id' }),
    __metadata("design:type", ledger_journal_entity_1.LedgerJournal)
], LedgerEntry.prototype, "journal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ledger_account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccount)
], LedgerEntry.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EntryDirection }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "created_at", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)('ledger_entries')
], LedgerEntry);
//# sourceMappingURL=ledger-entry.entity.js.map