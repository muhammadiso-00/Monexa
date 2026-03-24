"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const shared_module_1 = require("./shared/shared.module");
const auth_module_1 = require("./modules/auth/auth.module");
const ledger_module_1 = require("./modules/ledger/ledger.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
const payments_module_1 = require("./modules/payments/payments.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const transfers_module_1 = require("./modules/transfers/transfers.module");
const bot_module_1 = require("./modules/bot/bot.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            ledger_module_1.LedgerModule,
            wallets_module_1.WalletsModule,
            payments_module_1.PaymentsModule,
            webhooks_module_1.WebhooksModule,
            transfers_module_1.TransfersModule,
            bot_module_1.BotModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map