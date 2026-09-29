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
exports.CreateTariffDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTariffDto {
}
exports.CreateTariffDto = CreateTariffDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de usuario es obligatorio.' }),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "userType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de vehículo es obligatorio.' }),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El valor por hora debe ser numérico.' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTariffDto.prototype, "valorHora", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El valor mínimo debe ser numérico.' }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTariffDto.prototype, "valorMinimo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El valor máximo debe ser numérico.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTariffDto.prototype, "valorMaximo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTariffDto.prototype, "estado", void 0);
//# sourceMappingURL=create-tariff.dto.js.map