import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(search?: string, limit?: string): Promise<({
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
