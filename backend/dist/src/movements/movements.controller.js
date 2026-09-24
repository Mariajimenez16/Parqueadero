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
exports.MovementsController = void 0;
const common_1 = require("@nestjs/common");
const movements_service_1 = require("./movements.service");
const register_entry_dto_1 = require("./dto/register-entry.dto");
const register_exit_dto_1 = require("./dto/register-exit.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let MovementsController = class MovementsController {
    constructor(movementsService) {
        this.movementsService = movementsService;
    }
    async getActiveMovements() {
        return this.movementsService.getActiveMovements();
    }
    async getHistory(search, dateFrom, dateTo) {
        return this.movementsService.getHistory(search, dateFrom, dateTo);
    }
    async registerEntry(dto, operatorId) {
        return this.movementsService.registerEntry(dto, operatorId);
    }
    async registerExit(dto, operatorId) {
        return this.movementsService.registerExit(dto, operatorId);
    }
};
exports.MovementsController = MovementsController;
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)('ADMIN', 'VIGILANTE', 'CAJERO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "getActiveMovements", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)('ADMIN', 'VIGILANTE'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('entry'),
    (0, roles_decorator_1.Roles)('ADMIN', 'VIGILANTE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_entry_dto_1.RegisterEntryDto, String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "registerEntry", null);
__decorate([
    (0, common_1.Post)('exit'),
    (0, roles_decorator_1.Roles)('ADMIN', 'VIGILANTE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_exit_dto_1.RegisterExitDto, String]),
    __metadata("design:returntype", Promise)
], MovementsController.prototype, "registerExit", null);
exports.MovementsController = MovementsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('movements'),
    __metadata("design:paramtypes", [movements_service_1.MovementsService])
], MovementsController);
//# sourceMappingURL=movements.controller.js.map