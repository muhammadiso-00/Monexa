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
exports.PaymentIntent = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const payment_attempt_entity_1 = require("./payment-attempt.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "created";
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["REQUIRES_ACTION"] = "requires_action";
    PaymentStatus["AUTHORIZED"] = "authorized";
    PaymentStatus["CAPTURED"] = "captured";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELED"] = "canceled";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let PaymentIntent = class PaymentIntent {
    id;
    amount;
    currency;
    customer_id;
    merchant_id;
    status;
    attempts;
    created_at;
    updated_at;
};
exports.PaymentIntent = PaymentIntent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentIntent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PaymentIntent.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], PaymentIntent.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PaymentIntent.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PaymentIntent.prototype, "merchant_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.CREATED }),
    __metadata("design:type", String)
], PaymentIntent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_attempt_entity_1.PaymentAttempt, (attempt) => attempt.payment_intent, { cascade: true }),
    __metadata("design:type", Array)
], PaymentIntent.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentIntent.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentIntent.prototype, "updated_at", void 0);
exports.PaymentIntent = PaymentIntent = __decorate([
    (0, typeorm_1.Entity)('payment_intents')
], PaymentIntent);
//# sourceMappingURL=payment-intent.entity.js.map