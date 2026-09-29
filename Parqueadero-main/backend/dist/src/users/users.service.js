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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, role, status) {
        const where = {};
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { nombre: { contains: search } },
                { apellidos: { contains: search } },
                { documento: { contains: search } },
                { correo: { contains: search } },
            ];
        }
        const users = await this.prisma.user.findMany({
            where,
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
                vehicles: {
                    select: {
                        id: true,
                        placa: true,
                        type: true,
                        marca: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                vehicles: true,
                reservations: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                movements: {
                    take: 10,
                    orderBy: { entryTime: 'desc' },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    async create(createUserDto, adminId) {
        const existingEmail = await this.prisma.user.findUnique({
            where: { correo: createUserDto.correo.toLowerCase().trim() },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('El correo electrónico ya se encuentra registrado.');
        }
        const existingDoc = await this.prisma.user.findUnique({
            where: { documento: createUserDto.documento.trim() },
        });
        if (existingDoc) {
            throw new common_1.ConflictException('El documento de identidad ya se encuentra registrado.');
        }
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);
        const newUser = await this.prisma.user.create({
            data: {
                nombre: createUserDto.nombre.trim(),
                apellidos: createUserDto.apellidos.trim(),
                documento: createUserDto.documento.trim(),
                correo: createUserDto.correo.toLowerCase().trim(),
                telefono: createUserDto.telefono.trim(),
                passwordHash,
                userType: createUserDto.userType || 'ESTUDIANTE',
                role: createUserDto.role || 'USUARIO',
                status: createUserDto.status || 'ACTIVO',
            },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'CREAR_USUARIO',
                    entidad: 'User',
                    entidadId: newUser.id,
                    detalles: `Usuario ${newUser.nombre} ${newUser.apellidos} (${newUser.correo}) creado con rol ${newUser.role}`,
                },
            });
        }
        const { passwordHash: _, ...result } = newUser;
        return result;
    }
    async update(id, updateUserDto, adminId) {
        await this.findOne(id);
        const dataToUpdate = { ...updateUserDto };
        if (updateUserDto.password) {
            dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
            delete dataToUpdate.password;
        }
        if (updateUserDto.correo) {
            dataToUpdate.correo = updateUserDto.correo.toLowerCase().trim();
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: 'ACTUALIZAR_USUARIO',
                    entidad: 'User',
                    entidadId: id,
                    detalles: `Datos del usuario ${updatedUser.correo} actualizados`,
                },
            });
        }
        const { passwordHash: _, ...result } = updatedUser;
        return result;
    }
    async changeStatus(id, status, adminId) {
        if (!['ACTIVO', 'BLOQUEADO', 'INACTIVO'].includes(status)) {
            throw new common_1.BadRequestException('Estado inválido. Debe ser ACTIVO, BLOQUEADO o INACTIVO.');
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: { status },
        });
        if (adminId) {
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    accion: status === 'BLOQUEADO' ? 'BLOQUEAR_USUARIO' : 'CAMBIO_ESTADO_USUARIO',
                    entidad: 'User',
                    entidadId: id,
                    detalles: `Estado del usuario ${user.correo} cambiado a ${status}`,
                },
            });
        }
        return { message: `Estado del usuario actualizado a ${status} exitosamente.`, user };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map