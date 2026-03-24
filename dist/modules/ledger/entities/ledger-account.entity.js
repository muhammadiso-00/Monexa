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
exports.LedgerAccount = exports.LedgerAccountType = void 0;
const typeorm_1 = require("typeorm");
var LedgerAccountType;
(function (LedgerAccountType) {
    LedgerAccountType["ASSET"] = "asset";
    LedgerAccountType["LIABILITY"] = "liability";
    LedgerAccountType["REVENUE"] = "revenue";
    LedgerAccountType["EXPENSE"] = "expense";
})(LedgerAccountType || (exports.LedgerAccountType = LedgerAccountType = {}));
let LedgerAccount = class LedgerAccount {
    id;
    name;
    type;
    owner_id;
    currency;
    created_at;
};
exports.LedgerAccount = LedgerAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], LedgerAccount.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: LedgerAccountType }),
    __metadata("design:type", String)
], LedgerAccount.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LedgerAccount.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], LedgerAccount.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerAccount.prototype, "created_at", void 0);
exports.LedgerAccount = LedgerAccount = __decorate([
    (0, typeorm_1.Entity)('ledger_accounts')
], LedgerAccount);
//# sourceMappingURL=ledger-account.entity.js.map