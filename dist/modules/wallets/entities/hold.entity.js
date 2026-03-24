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
exports.Hold = exports.HoldStatus = void 0;
const typeorm_1 = require("typeorm");
const wallet_entity_1 = require("./wallet.entity");
var HoldStatus;
(function (HoldStatus) {
    HoldStatus["ACTIVE"] = "active";
    HoldStatus["RELEASED"] = "released";
    HoldStatus["CAPTURED"] = "captured";
})(HoldStatus || (exports.HoldStatus = HoldStatus = {}));
let Hold = class Hold {
    id;
    wallet;
    amount;
    status;
    description;
    created_at;
    expires_at;
};
exports.Hold = Hold;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Hold.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", wallet_entity_1.Wallet)
], Hold.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Hold.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: HoldStatus, default: HoldStatus.ACTIVE }),
    __metadata("design:type", String)
], Hold.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Hold.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Hold.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Hold.prototype, "expires_at", void 0);
exports.Hold = Hold = __decorate([
    (0, typeorm_1.Entity)('holds')
], Hold);
//# sourceMappingURL=hold.entity.js.map