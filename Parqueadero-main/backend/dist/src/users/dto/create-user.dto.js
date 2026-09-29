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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es obligatorio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Los apellidos son obligatorios.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "apellidos", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El documento de identidad es obligatorio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "documento", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Debe proporcionar un correo electrónico válido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El correo electrónico es obligatorio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "correo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de teléfono es obligatorio.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La contraseña es obligatoria.' }),
    (0, class_validator_1.MinLength)(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
//# sourceMappingURL=create-user.dto.js.map