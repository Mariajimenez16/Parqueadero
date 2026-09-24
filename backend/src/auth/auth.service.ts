import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { correo, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { correo: correo.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas: Correo o contraseña incorrectos.');
    }

    if (user.status === 'BLOQUEADO') {
      throw new UnauthorizedException('Su usuario se encuentra BLOQUEADO. No puede acceder al sistema.');
    }

    if (user.status === 'INACTIVO') {
      throw new UnauthorizedException('Su usuario se encuentra INACTIVO.');
    }

    const payload = {
      sub: user.id,
      correo: user.correo,
      role: user.role,
      userType: user.userType,
    };

    const token = this.jwtService.sign(payload);

    // Registrar log de auditoría
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

  async getProfile(userId: string) {
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
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return user;
  }
}
