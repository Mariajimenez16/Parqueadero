import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            nombre: string;
            apellidos: string;
            documento: string;
            correo: string;
            telefono: string;
            userType: string;
            role: string;
            status: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        nombre: string;
        apellidos: string;
        documento: string;
        correo: string;
        telefono: string;
        userType: string;
        role: string;
        status: string;
        createdAt: Date;
    }>;
}
