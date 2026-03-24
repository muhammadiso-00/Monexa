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
exports.PaymentAttempt = exports.AttemptStatus = void 0;
const typeorm_1 = require("typeorm");
const payment_intent_entity_1 = require("./payment-intent.entity");
var AttemptStatus;
(function (AttemptStatus) {
    AttemptStatus["PROCESSING"] = "processing";
    AttemptStatus["SUCCEEDED"] = "succeeded";
    AttemptStatus["FAILED"] = "failed";
})(AttemptStatus || (exports.AttemptStatus = AttemptStatus = {}));
let PaymentAttempt = class PaymentAttempt {
    id;
    payment_intent;
    idempotency_key;
    status;
    error_code;
    error_message;
    created_at;
};
exports.PaymentAttempt = PaymentAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentAttempt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_intent_entity_1.PaymentIntent, (intent) => intent.attempts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_intent_id' }),
    __metadata("design:type", payment_intent_entity_1.PaymentIntent)
], PaymentAttempt.prototype, "payment_intent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PaymentAttempt.prototype, "idempotency_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AttemptStatus, default: AttemptStatus.PROCESSING }),
    __metadata("design:type", String)
], PaymentAttempt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentAttempt.prototype, "error_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentAttempt.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentAttempt.prototype, "created_at", void 0);
exports.PaymentAttempt = PaymentAttempt = __decorate([
    (0, typeorm_1.Entity)('payment_attempts')
], PaymentAttempt);
//# sourceMappingURL=payment-attempt.entity.js.map