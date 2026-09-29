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
exports.SpacesController = void 0;
const common_1 = require("@nestjs/common");
const spaces_service_1 = require("./spaces.service");
const create_space_dto_1 = require("./dto/create-space.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let SpacesController = class SpacesController {
    constructor(spacesService) {
        this.spacesService = spacesService;
    }
    async findAll(zona, estado, tipo) {
        return this.spacesService.findAll(zona, estado, tipo);
    }
    async getSummary() {
        return this.spacesService.getMapSummary();
    }
    async create(createSpaceDto, adminId) {
        return this.spacesService.create(createSpaceDto, adminId);
    }
    async updateState(id, estado, adminId) {
        return this.spacesService.updateState(id, estado, adminId);
    }
};
exports.SpacesController = SpacesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('zona')),
    __param(1, (0, common_1.Query)('estado')),
    __param(2, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_space_dto_1.CreateSpaceDto, String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('estado')),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "updateState", null);
exports.SpacesController = SpacesController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('spaces'),
    __metadata("design:paramtypes", [spaces_service_1.SpacesService])
], SpacesController);
//# sourceMappingURL=spaces.controller.js.map