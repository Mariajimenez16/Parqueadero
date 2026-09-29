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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getOccupancy(startDate, endDate) {
        return this.reportsService.getOccupancyReport(startDate, endDate);
    }
    async getRevenue(period, dateFrom, dateTo) {
        return this.reportsService.getRevenueReport(period, dateFrom, dateTo);
    }
    async getPeakHours() {
        return this.reportsService.getPeakHoursReport();
    }
    async getSpaceUtilization() {
        return this.reportsService.getSpaceUtilizationReport();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('occupancy'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getOccupancy", null);
__decorate([
    (0, common_1.Get)('revenue'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getRevenue", null);
__decorate([
    (0, common_1.Get)('peak-hours'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPeakHours", null);
__decorate([
    (0, common_1.Get)('spaces-utilization'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSpaceUtilization", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map