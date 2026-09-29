import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: string;
        correo: string;
        role: string;
    }): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        correo: string;
        role: string;
        userType: string;
        status: string;
    }>;
}
export {};
