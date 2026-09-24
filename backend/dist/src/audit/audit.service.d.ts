import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    getLogs(search?: string, limit?: number): Promise<({
        user: {
            id: string;
            nombre: string;
            apellidos: string;
            correo: string;
            role: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        accion: string;
        entidad: string;
        entidadId: string | null;
        detalles: string | null;
    })[]>;
}
