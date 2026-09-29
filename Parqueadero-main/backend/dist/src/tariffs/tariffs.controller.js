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
exports.TariffsController = void 0;
const common_1 = require("@nestjs/common");
const tariffs_service_1 = require("./tariffs.service");
const create_tariff_dto_1 = require("./dto/create-tariff.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let TariffsController = class TariffsController {
    constructor(tariffsService) {
        this.tariffsService = tariffsService;
    }
    async findAll() {
        return this.tariffsService.findAll();
    }
    async create(createTariffDto, adminId) {
        return this.tariffsService.create(createTariffDto, adminId);
    }
    async update(id, updateDto, adminId) {
        return this.tariffsService.update(id, updateDto, adminId);
    }
};
exports.TariffsController = TariffsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tariff_dto_1.CreateTariffDto, String]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "update", null);
exports.TariffsController = TariffsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tariffs'),
    __metadata("design:paramtypes", [tariffs_service_1.TariffsService])
], TariffsController);
//# sourceMappingURL=tariffs.controller.js.map