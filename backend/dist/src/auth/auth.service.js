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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { correo, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { correo: correo.toLowerCase().trim() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
        }
        if (user.status === 'BLOQUEADO') {
            throw new common_1.UnauthorizedException('Su usuario se encuentra BLOQUEADO. No puede acceder al sistema.');
        }
        if (user.status === 'INACTIVO') {
            throw new common_1.UnauthorizedException('Su usuario se encuentra INACTIVO.');
        }
        const payload = {
            sub: user.id,
            correo: user.correo,
            role: user.role,
            userType: user.userType,
        };
        const token = this.jwtService.sign(payload);
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                accion: 'LOGIN_EXITOSO',
                entidad: 'User',
                entidadId: user.id,
                detalles: `Inicio de sesión exitoso como ${user.role} (${user.correo})`,
            },
        });
        return {
            accessToken: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellidos: user.apellidos,
                documento: user.documento,
                correo: user.correo,
                telefono: user.telefono,
                userType: user.userType,
                role: user.role,
                status: user.status,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                documento: true,
                correo: true,
                telefono: true,
                userType: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado.');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map