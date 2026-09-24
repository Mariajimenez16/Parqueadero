import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, role?: string, status?: string) {
    const where: any = {};

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

  async findOne(id: string) {
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
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async create(createUserDto: CreateUserDto, adminId?: string) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { correo: createUserDto.correo.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado.');
    }

    const existingDoc = await this.prisma.user.findUnique({
      where: { documento: createUserDto.documento.trim() },
    });
    if (existingDoc) {
      throw new ConflictException('El documento de identidad ya se encuentra registrado.');
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

  async update(id: string, updateUserDto: UpdateUserDto, adminId?: string) {
    await this.findOne(id); // Verificar existencia

    const dataToUpdate: any = { ...updateUserDto };

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

  async changeStatus(id: string, status: string, adminId?: string) {
    if (!['ACTIVO', 'BLOQUEADO', 'INACTIVO'].includes(status)) {
      throw new BadRequestException('Estado inválido. Debe ser ACTIVO, BLOQUEADO o INACTIVO.');
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
}
