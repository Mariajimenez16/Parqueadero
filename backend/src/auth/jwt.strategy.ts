import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-parqueadero-key-2026-sistemas-empresariales',
    });
  }

  async validate(payload: { sub: string; correo: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido o el usuario ya no existe.');
    }

    if (user.status === 'BLOQUEADO') {
      throw new UnauthorizedException('Su usuario se encuentra BLOQUEADO en el sistema. Contacte al Administrador.');
    }

    if (user.status === 'INACTIVO') {
      throw new UnauthorizedException('Su usuario se encuentra INACTIVO.');
    }

    return {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      correo: user.correo,
      role: user.role,
      userType: user.userType,
      status: user.status,
    };
  }
}
