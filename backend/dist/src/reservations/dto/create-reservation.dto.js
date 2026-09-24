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
exports.CreateReservationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateReservationDto {
}
exports.CreateReservationDto = CreateReservationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del usuario es obligatorio.' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del vehículo es obligatorio.' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del espacio es obligatorio.' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "spaceId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha debe ser una fecha ISO válida (YYYY-MM-DD).' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La hora de inicio debe ser una fecha/hora ISO válida.' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "horaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La hora de fin debe ser una fecha/hora ISO válida.' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "horaFin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "observaciones", void 0);
//# sourceMappingURL=create-reservation.dto.js.map